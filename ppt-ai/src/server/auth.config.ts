import { type NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { env } from "@/env";
import { type DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session extends DefaultSession {
        user: {
            id: string;
            hasAccess: boolean;
            location?: string;
            role: string;
            isAdmin: boolean;
        } & DefaultSession["user"];
    }

    interface User {
        hasAccess: boolean;
        role: string;
    }
}

export const authConfig = {
    providers: [
        GoogleProvider({
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
    session: {
        strategy: "jwt",
    },
    callbacks: {
        // Session callback is safe for Edge (no DB calls here, it uses token)
        session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.hasAccess = token.hasAccess as boolean;
                session.user.location = token.location as string;
                session.user.role = token.role as string;
                session.user.isAdmin = token.role === "ADMIN";
            }
            return session;
        },
        // We only include a basic JWT callback here or rely on the default.
        // The complex DB-dependent JWT logic stays in the full auth.ts
    },
    trustHost: true,
} satisfies NextAuthConfig;
