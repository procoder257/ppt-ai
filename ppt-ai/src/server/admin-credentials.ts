import { createHash, timingSafeEqual } from "node:crypto";

/** Minimum length accepted for ADMIN_PASSWORD. Shorter values disable admin login. */
export const MIN_ADMIN_PASSWORD_LENGTH = 12;

export function parseAdminEmails(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/** Constant-time string comparison (hashing first so lengths always match). */
function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

/**
 * Checks admin credentials against ADMIN_EMAILS / ADMIN_PASSWORD.
 * Admin login is disabled entirely when ADMIN_PASSWORD is missing or too short.
 */
export function verifyAdminCredentials(
  email: unknown,
  password: unknown,
  config: { adminEmails: string | undefined; adminPassword: string | undefined },
): boolean {
  if (typeof email !== "string" || typeof password !== "string") return false;

  const adminPassword = config.adminPassword;
  if (!adminPassword || adminPassword.length < MIN_ADMIN_PASSWORD_LENGTH) {
    return false;
  }

  const isAdminEmail = parseAdminEmails(config.adminEmails).includes(
    email.trim().toLowerCase(),
  );
  // Always run the comparison so timing doesn't reveal whether the email matched.
  const passwordMatches = safeEqual(password, adminPassword);
  return isAdminEmail && passwordMatches;
}
