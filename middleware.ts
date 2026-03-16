import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const token =
    req.cookies.get("token")?.value ||
    req.headers.get("authorization")?.split(" ")[1];

  const isProtected = req.nextUrl.pathname.startsWith("/roles");

  if (isProtected && !token) {
    const loginUrl = new URL("/", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/roles/:path*"],
};