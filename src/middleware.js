import { NextResponse } from "next/server";
// import  { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  const loginUrl = new URL("/login", req.url);
  const dashboardUrl = new URL("/dashboard", req.url);

  // 🚫 No token → block dashboard
  if (!token && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(loginUrl);
  }

  // 🔁 Token exists → block login page
  if (token && pathname === "/login") {
    return NextResponse.redirect(dashboardUrl);
  }

  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jwtVerify(token, secret);
      return NextResponse.next();
    } catch {
      // ❌ Invalid or expired token → remove cookie
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete("token");
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/dashboard/:path*"],
};
