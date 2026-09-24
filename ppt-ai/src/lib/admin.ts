import { env } from "@/env";

export function isAdmin(email?: string | null) {
    if (!email) return false;

    const adminEmails =
        env.ADMIN_EMAILS?.split(",").map((e) => e.trim().toLowerCase()) || [];
    return adminEmails.includes(email.toLowerCase());
}
