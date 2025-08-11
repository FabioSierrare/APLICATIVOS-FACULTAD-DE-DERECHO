import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_SECRET);
    const { payload: decoded } = await jwtVerify(token, secret);

    // Validación de rutas para admin
    if (request.nextUrl.pathname.startsWith("/admin") && decoded.rol !== "Administrador") {
      if (decoded.rol === "Estudiante") {
        return NextResponse.redirect(new URL("/home", request.url));
      } else if (decoded.rol === "Profesor") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    // Validación de rutas para home (estudiantes)
    if (request.nextUrl.pathname.startsWith("/home") && decoded.rol !== "Estudiante" && decoded.rol !== "Administrador") {
      if (decoded.rol === "Profesor") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    // Validación de rutas para profesores
    if (request.nextUrl.pathname.startsWith("/") && decoded.rol !== "Profesor" && decoded.rol !== "Administrador") {
      if (decoded.rol === "Estudiante") {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
    }

  } catch (err) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/home/:path*"],
};
