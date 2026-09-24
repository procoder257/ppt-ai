import { NextResponse } from "next/server";
import { db } from "@/server/db";

export const dynamic = "force-dynamic";

const DB_TIMEOUT_MS = 3000;

/**
 * Liveness/readiness probe for uptime monitors and load balancers.
 * Returns 200 when the app can reach the database, 503 otherwise.
 * Deliberately reveals no versions, hostnames or error details.
 */
export async function GET() {
  const startedAt = Date.now();
  let database: "ok" | "error" = "ok";

  try {
    await Promise.race([
      db.$queryRaw`SELECT 1`,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), DB_TIMEOUT_MS),
      ),
    ]);
  } catch (error) {
    database = "error";
    console.error("[health] database check failed:", error);
  }

  const healthy = database === "ok";
  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      checks: { database },
      latencyMs: Date.now() - startedAt,
    },
    {
      status: healthy ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
