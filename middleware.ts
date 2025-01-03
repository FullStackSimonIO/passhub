import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const tokenObj = req.cookies.get("token");
  const token = tokenObj?.value || null;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const isExpired = payload.exp * 1000 < Date.now();

    if (isExpired) {
      console.log("Token expired. Attempting to refresh...");

      const refreshToken = req.cookies.get("refresh_token")?.value;
      if (!refreshToken) {
        console.error("No refresh token found.");
        return NextResponse.redirect(new URL("/login", req.url));
      }

      const refreshResponse = await fetch(
        "https://backend.example.com/api/refresh",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken }),
        }
      );

      if (!refreshResponse.ok) {
        console.error("Failed to refresh token.");
        return NextResponse.redirect(new URL("/login", req.url));
      }

      const { token: newToken } = await refreshResponse.json();
      const response = NextResponse.next();

      response.cookies.set("token", newToken, { httpOnly: true });
      console.log("Token refreshed successfully.");
      return response;
    }

    console.log("Token is valid.");
  } catch (error) {
    console.error("Error verifying or refreshing token:", error);
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}
