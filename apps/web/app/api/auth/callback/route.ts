import { NextRequest, NextResponse } from "next/server";

const ALLOWED_REDIRECTS = [
  "/super-admin",
  "/admin",
  "/manager",
  "/corporate",
  "/mentor",
  "/member",
  "/dashboard",
];

const isProduction = process.env.NODE_ENV === "production";

// GET /api/auth/callback?token=xxx&redirect=/super-admin
// Sets the auth cookie on the Vercel domain and redirects in one response.
// This avoids the race condition of a separate fetch + window.location.href.
export async function GET(req: NextRequest) {
  const token    = req.nextUrl.searchParams.get("token");
  const redirect = req.nextUrl.searchParams.get("redirect") ?? "/";

  if (!token) {
    return NextResponse.redirect(new URL("/login?error=no_token", req.url));
  }

  // Validate redirect to prevent open redirect
  const safe = ALLOWED_REDIRECTS.find((r) => redirect.startsWith(r)) ?? "/login";

  const res = NextResponse.redirect(new URL(safe, req.url));
  res.cookies.set("token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
  return res;
}
