import NextAuth from "next-auth";
import { authConfig } from "@/server/auth.config";
import { NextResponse, type NextRequest } from "next/server";

const { auth } = NextAuth(authConfig);

export async function middleware(request: NextRequest) {
  const session = await auth();
  const pathname = request.nextUrl.pathname;

  const isAuthPage = pathname.startsWith("/auth");
  const isPricingPage = pathname.startsWith("/pricing");
  const isAdminPage = pathname.startsWith("/admin");
  const isApiRoute = pathname.startsWith("/api");
  const isPublicPage =
    pathname.startsWith("/blog") ||
    pathname.startsWith("/use-cases") ||
    pathname.startsWith("/about") ||
    pathname === "/cookies";

  console.log("[Middleware]", {
    path: pathname,
    hasSession: !!session,
    isAuthPage,
    isPricingPage,
    isApiRoute
  });

  // Root path handling - ALLOW ALL
  if (pathname === "/") {
    console.log("[Middleware] Root path accessed - showing landing page");
    return NextResponse.next();
  }

  // If user is not authenticated and trying to access a protected route, redirect to sign-in
  if (!session && !isAuthPage && !isPricingPage && !isApiRoute && !isAdminPage && !isPublicPage) {
    console.log("[Middleware] No session on protected route → /auth/signin");
    return NextResponse.redirect(
      new URL(
        `/auth/signin?callbackUrl=${encodeURIComponent(request.url)}`,
        request.url,
      ),
    );
  }

  if (isAdminPage && !pathname.includes("/admin/login")) {
    if (!session) {
      console.log("[Middleware] Admin page (Unauthenticated) → /admin/login");
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    const adminEmails = process.env.ADMIN_EMAILS?.split(",").map(e => e.trim()) || [];
    const userEmail = session.user?.email;

    console.log("[Middleware] Admin Check:", {
      userEmail,
      adminEmails,
      envValue: process.env.ADMIN_EMAILS
    });

    if (!userEmail || !adminEmails.includes(userEmail)) {
      console.log("[Middleware] Admin page (Unauthorized) → /");
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // If user is on auth page but already signed in, redirect to pricing (subscription check happens there)
  if (isAuthPage && session) {
    console.log("[Middleware] Already signed in on auth page → /pricing or /presentation");
    const target = session.user?.hasAccess ? "/presentation" : "/pricing";
    return NextResponse.redirect(new URL(target, request.url));
  }

  console.log("[Middleware] Allowing request to continue");
  return NextResponse.next();
}

// Add routes that should be protected by authentication
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|testimonials|auth-visuals|terms|privacy).*)"],
};
