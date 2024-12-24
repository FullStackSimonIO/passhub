import { NextResponse } from "next/server";

export function middleware(req) {
  // Token aus den Cookies abrufen
  const tokenObj = req.cookies.get("token"); // Liefert ein Objekt mit { name, value }
  const token = tokenObj?.value || null; // Greife auf die `value`-Eigenschaft zu

  console.log("Retrieved token from cookies:", token);

  // Prüfen, ob Token vorhanden ist
  if (!token || typeof token !== "string") {
    console.error("No valid token found or token is not a string:", token);
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Token verifizieren
  try {
    const payload = JSON.parse(atob(token.split(".")[1])); // JWT Payload dekodieren
    console.log("Token Payload:", payload);

    const isExpired = payload.exp * 1000 < Date.now(); // Ablaufzeit prüfen
    if (isExpired) {
      console.error("Token expired");
      return NextResponse.redirect(new URL("/login", req.url));
    }
  } catch (error) {
    console.error("Invalid token:", error);
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Weiterleitung zulassen
  return NextResponse.next();
}

// Konfiguration der Middleware
export const config = {
  matcher: ["/dashboard/:path*", "/protected/:path*"],
};
