import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload: decoded } = await jwtVerify(token, secret);

    // Debug logs
    const role = decoded.Rol;

    // Admin
    if (request.nextUrl.pathname.startsWith("/admin") && role !== "Administrador") {
      if (role === "Estudiante") {
        return NextResponse.redirect(new URL("/home", request.url));
      } else if (role === "Profesor") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    // Home (estudiantes)
    if (request.nextUrl.pathname.startsWith("/home") && role !== "Estudiante" && role !== "Administrador") {
      if (role === "Profesor") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    } catch (err) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/home/:path*"],
};
