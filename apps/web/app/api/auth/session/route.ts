import { NextRequest, NextResponse } from "next/server";

const isProduction = process.env.NODE_ENV === "production";

// POST /api/auth/session — called after Railway login to set the token cookie
// on the Vercel domain so the Next.js middleware can read it.
export async function POST(req: NextRequest) {
  const { token } = await req.json();
  if (!token) return NextResponse.json({ error: "No token" }, { status: 400 });

  const res = NextResponse.json({ ok: true });
  res.cookies.set("token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
  return res;
}

// DELETE /api/auth/session — clears the cookie on logout
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("token", "", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
