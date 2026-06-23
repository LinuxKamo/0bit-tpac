import { NextResponse } from "next/server";

// Auth is handled client-side via AuthContext/loadUser.
// No server-side middleware cookie checks — the API is on a separate domain
// (Railway) so its httpOnly cookie is not visible here.
export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
