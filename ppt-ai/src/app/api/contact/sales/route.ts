import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, companyName, employeeCount, revenueRange, role } = body;

        // Basic validation
        if (!name || !companyName || !employeeCount || !revenueRange || !role) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        console.log("Enterprise Lead Received:", {
            name,
            companyName,
            employeeCount,
            revenueRange,
            role,
            timestamp: new Date().toISOString(),
        });

        // TODO: Send email to admin account

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error processing sales contact:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
