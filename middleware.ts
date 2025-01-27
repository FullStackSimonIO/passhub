import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const tokenObj = req.cookies.get("token");
  const token = tokenObj?.value || null;

  console.log("Middleware triggered for:", req.url);
  console.log("Token found:", token);

  if (!token) {
    console.log("No token, redirecting to /login");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    console.log("Token payload:", payload);

    const isExpired = payload.exp * 1000 < Date.now();
    if (isExpired) {
      console.log("Token expired, redirecting to /login");
      return NextResponse.redirect(new URL("/login", req.url));
    }
  } catch (error) {
    console.log("Token is invalid, redirecting to /login", error);
    return NextResponse.redirect(new URL("/login", req.url));
  }

  console.log("Token is valid, proceeding to:", req.url);
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/protected/:path*"], // Exkludiere "/login"
};
