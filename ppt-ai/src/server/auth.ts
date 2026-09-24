import { db } from "@/server/db";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth, { type Session } from "next-auth";
import { type Adapter } from "next-auth/adapters";
import { authConfig } from "./auth.config";
import CredentialsProvider from "next-auth/providers/credentials";
import { EmailService } from "./email/service";

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.hasAccess = user.hasAccess;
        token.name = user.name;
        token.image = user.image;
        token.picture = user.image;
        token.location = (user as Session["user"]).location;
        token.role = user.role;
        token.isAdmin = user.role === "ADMIN";
      }

      // Handle updates
      if (trigger === "update" && (session as Session)?.user) {
        const user = await db.user.findUnique({
          where: { id: token.id as string },
        });
        if (session) {
          token.name = (session as Session).user.name;
          token.image = (session as Session).user.image;
          token.picture = (session as Session).user.image;
          token.location = (session as Session).user.location;
          token.role = (session as Session).user.role;
          token.isAdmin = (session as Session).user.role === "ADMIN";
        }
        if (user) {
          token.hasAccess = user?.hasAccess ?? false;
          token.role = user.role;
          token.isAdmin = user.role === "ADMIN";
        }
      }

      return token;
    },

    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const dbUser = await db.user.findUnique({
          where: { email: user.email! },
          select: { id: true, hasAccess: true, role: true },
        });

        if (dbUser) {
          user.hasAccess = dbUser.hasAccess;
          user.role = dbUser.role;
        } else {
          user.hasAccess = false;
          user.role = "USER";
        }
      }

      return true;
    },
  },
  events: {
    async createUser({ user }) {
      if (user.email) {
        try {
          await EmailService.sendWelcomeEmail(user.email, user.name ?? "there");
        } catch (error) {
          console.error("Failed to send welcome email:", error);
        }
      }
    }
  },
  adapter: PrismaAdapter(db) as Adapter,
  providers: [
    ...authConfig.providers,
    CredentialsProvider({
      name: "Admin Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const adminEmails = process.env.ADMIN_EMAILS?.split(",").map(e => e.trim()) || [];
        const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

        if (!credentials?.email || !credentials?.password) return null;

        if (adminEmails.includes(credentials.email as string) && credentials.password === adminPassword) {
          const user = await db.user.findUnique({
            where: { email: credentials.email as string }
          });

          if (user) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.image,
              role: "ADMIN",
              hasAccess: true
            };
          } else {
            return {
              id: "admin-temp-id",
              name: "Admin User",
              email: credentials.email as string,
              role: "ADMIN",
              hasAccess: true
            };
          }
        }
        return null;
      }
    })
  ],
});
