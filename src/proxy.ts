import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth-edge";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes — no login needed
  const publicRoutes = ["/login", "/api/auth/login"];
  if (publicRoutes.some((r) => pathname.startsWith(r))) {
    const response = NextResponse.next();
    response.headers.set("x-pathname", pathname);
    return response;
  }

  // Read session from cookie
  const token = request.cookies.get("eyf_session")?.value;
  const session = token ? await verifyToken(token) : null;

  // Not logged in → redirect to login
  if (!session) {
    const url = new URL("/login", request.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // INVITEE → can only access /my-ticket or /api/auth/*
  if (session.role === "INVITEE") {
    const allowed =
      pathname.startsWith("/my-ticket") ||
      pathname.startsWith("/api/auth") ||
      pathname.startsWith("/api/tickets");
    if (!allowed) return NextResponse.redirect(new URL("/my-ticket", request.url));
    const response = NextResponse.next();
    response.headers.set("x-pathname", pathname);
    return response;
  }

  // BOUNCER → can only access /scan or /api/scan or /api/auth/*
  if (session.role === "BOUNCER") {
    const allowed =
      pathname === "/scan" ||
      pathname.startsWith("/api/scan") ||
      pathname.startsWith("/api/auth");
    if (!allowed) return NextResponse.redirect(new URL("/scan", request.url));
    const response = NextResponse.next();
    response.headers.set("x-pathname", pathname);
    return response;
  }

  // ADMIN → full access
  const response = NextResponse.next();
  response.headers.set("x-pathname", pathname);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};