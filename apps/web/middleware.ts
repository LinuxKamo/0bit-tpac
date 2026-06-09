import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Routes that require a valid session
const PROTECTED_PREFIXES = [
  "/super-admin",
  "/admin",
  "/manager",
  "/member",
  "/mentor",
  "/corporate",
  "/settings",
  "/notifications",
  "/profile",
  "/dashboard",
];

// Routes only accessible to guests (redirect to dashboard if already logged in)
const GUEST_ONLY = ["/login", "/register", "/forgot-password", "/reset-password", "/set-password", "/verify"];

const ROLE_HOME: Record<string, string> = {
  SUPER_ADMIN:     "/super-admin",
  ADMIN:           "/admin",
  MANAGER:         "/manager",
  CORPORATE_ADMIN: "/corporate",
  MENTOR:          "/mentor",
  MEMBER:          "/member",
};

async function verifyToken(token: string): Promise<{ userId: string; role: string } | null> {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "fallback-secret");
    const { payload } = await jwtVerify(token, secret);
    return { userId: payload.userId as string, role: payload.role as string };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isGuestOnly = GUEST_ONLY.some((p) => pathname.startsWith(p));

  // Verify the token cryptographically — don't trust cookie existence alone
  const payload = token ? await verifyToken(token) : null;
  const isAuthenticated = !!payload;

  // Unauthenticated user hitting a protected route → clear stale cookies + send to login
  if (isProtected && !isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.delete("auth"); // keep URL clean
    const response = NextResponse.redirect(url);
    // Clear any stale cookies so middleware doesn't loop
    response.cookies.delete("token");
    response.cookies.delete("user_role");
    return response;
  }

  // Authenticated user hitting login/register → send them to their role home
  if (isGuestOnly && isAuthenticated) {
    const role = payload.role ?? "";
    const home = ROLE_HOME[role] ?? "/dashboard";
    const url = request.nextUrl.clone();
    url.pathname = home;
    return NextResponse.redirect(url);
  }

  // Set user_role cookie from verified JWT (keeps it in sync)
  if (isAuthenticated && payload.role) {
    const response = NextResponse.next();
    response.cookies.set("user_role", payload.role, {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
    });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public|api).*)",
  ],
};
