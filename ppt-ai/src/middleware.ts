import { auth } from "@/server/auth";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const session = await auth();
  const pathname = request.nextUrl.pathname;

  const isAuthPage = pathname.startsWith("/auth");
  const isPricingPage = pathname.startsWith("/pricing");
  const isAdminPage = pathname.startsWith("/admin");
  const isApiRoute = pathname.startsWith("/api");

  console.log("[Middleware]", {
    path: pathname,
    hasSession: !!session,
    isAuthPage,
    isPricingPage,
    isApiRoute
  });

  // Root path handling
  if (pathname === "/") {
    if (session) {
      console.log("[Middleware] Root (Authenticated) → /pricing");
      return NextResponse.redirect(new URL("/pricing", request.url));
    } else {
      console.log("[Middleware] Root (Unauthenticated) → /auth/signin");
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }
  }

  // If user is not authenticated and trying to access a protected route, redirect to sign-in
  if (!session && !isAuthPage && !isPricingPage && !isApiRoute) {
    console.log("[Middleware] No session on protected route → /auth/signin");
    return NextResponse.redirect(
      new URL(
        `/auth/signin?callbackUrl=${encodeURIComponent(request.url)}`,
        request.url,
      ),
    );
  }

  // Admin route protection
  if (isAdminPage) {
    if (!session) {
      console.log("[Middleware] Admin page (Unauthenticated) → /auth/signin");
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }

    const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];
    const userEmail = session.user?.email;

    if (!userEmail || !adminEmails.includes(userEmail)) {
      console.log("[Middleware] Admin page (Unauthorized) → /");
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // If user is on auth page but already signed in, redirect to pricing (subscription check happens there)
  if (isAuthPage && session) {
    console.log("[Middleware] Already signed in on auth page → /pricing");
    return NextResponse.redirect(new URL("/pricing", request.url));
  }

  console.log("[Middleware] Allowing request to continue");
  return NextResponse.next();
}

// Add routes that should be protected by authentication
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
