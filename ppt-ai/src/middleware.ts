import NextAuth, { type Session } from "next-auth";
import { authConfig } from "@/server/auth.config";
import { NextResponse, type NextRequest } from "next/server";

const { auth } = NextAuth(authConfig);

function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return adminEmails.includes(email.toLowerCase());
}

export async function middleware(request: NextRequest) {
  let session: Session | null = null;
  try {
    session = await auth();
  } catch (err) {
    console.error("[Middleware] auth() failed — allowing request through:", err);
    return NextResponse.next();
  }
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

  // Landing page is public
  if (pathname === "/") {
    return NextResponse.next();
  }

  // If user is not authenticated and trying to access a protected route, redirect to sign-in
  if (!session && !isAuthPage && !isPricingPage && !isApiRoute && !isAdminPage && !isPublicPage) {
    return NextResponse.redirect(
      new URL(
        `/auth/signin?callbackUrl=${encodeURIComponent(request.url)}`,
        request.url,
      ),
    );
  }

  if (isAdminPage && !pathname.includes("/admin/login")) {
    if (!session) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    if (!isAdminEmail(session.user?.email)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Signed-in users don't need the auth pages
  if (isAuthPage && session) {
    const target = session.user?.hasAccess ? "/presentation" : "/pricing";
    return NextResponse.redirect(new URL(target, request.url));
  }

  return NextResponse.next();
}

// Add routes that should be protected by authentication
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|testimonials|auth-visuals|terms|privacy).*)"],
};
