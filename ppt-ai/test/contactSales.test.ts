import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const send = vi.fn();
const checkRateLimit = vi.fn();

vi.mock("@/server/auth", () => ({ auth: vi.fn().mockResolvedValue({ user: { email: "buyer@corp.com" } }) }));
vi.mock("@/lib/ratelimit", () => ({ checkRateLimit: (...a: unknown[]) => checkRateLimit(...a) }));
vi.mock("@/server/email/client", () => ({
  resend: { emails: { send: (...a: unknown[]) => send(...a) } },
  EMAIL_SENDER: "PPT AI <noreply@test>",
}));

const { POST } = await import("@/app/api/contact/sales/route");

const lead = {
  name: "Ada",
  companyName: "Acme",
  employeeCount: "51-200",
  revenueRange: "1-10M",
  role: "CTO",
};

function request(body: unknown, ip = "1.2.3.4") {
  return new NextRequest("http://localhost/api/contact/sales", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": `${ip}, 10.0.0.1` },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("POST /api/contact/sales", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    checkRateLimit.mockResolvedValue({ success: true });
    send.mockResolvedValue({ data: { id: "e1" }, error: null });
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv("SALES_EMAIL", "sales@pptai.test");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("emails the lead to the sales inbox with reply-to set", async () => {
    const res = await POST(request(lead));
    expect(res.status).toBe(200);
    expect(checkRateLimit).toHaveBeenCalledWith("contact-sales:1.2.3.4");
    expect(send).toHaveBeenCalledTimes(1);
    const email = send.mock.calls[0]?.[0];
    expect(email.to).toEqual(["sales@pptai.test"]);
    expect(email.replyTo).toBe("buyer@corp.com");
    expect(email.text).toContain("Company: Acme");
  });

  it("rejects invalid or oversized payloads", async () => {
    expect((await POST(request({ ...lead, name: "" }))).status).toBe(400);
    expect((await POST(request({ ...lead, role: "x".repeat(101) }))).status).toBe(400);
    expect((await POST(request("not json"))).status).toBe(400);
    expect(send).not.toHaveBeenCalled();
  });

  it("returns 429 when rate limited", async () => {
    checkRateLimit.mockResolvedValue({ success: false });
    expect((await POST(request(lead))).status).toBe(429);
    expect(send).not.toHaveBeenCalled();
  });

  it("still succeeds without email configured", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    vi.spyOn(console, "warn").mockImplementation(() => {});
    expect((await POST(request(lead))).status).toBe(200);
    expect(send).not.toHaveBeenCalled();
  });
});
