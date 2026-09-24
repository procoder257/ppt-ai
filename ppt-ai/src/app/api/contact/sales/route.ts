import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/server/auth";
import { checkRateLimit } from "@/lib/ratelimit";

const leadSchema = z.object({
  name: z.string().trim().min(1).max(100),
  companyName: z.string().trim().min(1).max(150),
  employeeCount: z.string().trim().min(1).max(50),
  revenueRange: z.string().trim().min(1).max(50),
  role: z.string().trim().min(1).max(100),
});

type SalesLead = z.infer<typeof leadSchema>;

function clientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function leadRecipients(): string[] {
  const configured = process.env.SALES_EMAIL ?? process.env.ADMIN_EMAILS ?? "";
  return configured
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
}

async function notifySales(lead: SalesLead, contactEmail: string | undefined) {
  const recipients = leadRecipients();
  if (!process.env.RESEND_API_KEY || recipients.length === 0) {
    console.warn("[Sales] Lead received but email is not configured (RESEND_API_KEY / SALES_EMAIL)");
    return;
  }

  const { resend, EMAIL_SENDER } = await import("@/server/email/client");
  const { error } = await resend.emails.send({
    from: EMAIL_SENDER,
    to: recipients,
    ...(contactEmail ? { replyTo: contactEmail } : {}),
    subject: `New enterprise lead: ${lead.companyName}`,
    text: [
      `Name: ${lead.name}`,
      `Company: ${lead.companyName}`,
      `Role: ${lead.role}`,
      `Employees: ${lead.employeeCount}`,
      `Revenue: ${lead.revenueRange}`,
      `Account email: ${contactEmail ?? "(not signed in)"}`,
      `Received: ${new Date().toISOString()}`,
    ].join("\n"),
  });
  if (error) {
    console.error("[Sales] Failed to send lead notification:", error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { success } = await checkRateLimit(`contact-sales:${clientIp(req)}`);
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 },
      );
    }

    const parsed = leadSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
    }

    const session = await auth().catch(() => null);
    await notifySales(parsed.data, session?.user?.email ?? undefined);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing sales contact:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
