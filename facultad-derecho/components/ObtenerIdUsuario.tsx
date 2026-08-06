"use client";

import { jwtDecode } from "jwt-decode";
import { TokenPayload } from "@/Model/PayloadToken";

export const ObtenerIdUsuario = (): number => {
  if (typeof window === "undefined") return 0;

  const token = localStorage.getItem("token");
  if (!token) return 0;

  try {
    const decoded = jwtDecode<TokenPayload>(token);
    return Number(decoded.Id ?? 0);
  } catch (error) {
    console.error("No se pudo decodificar el token:", error);
    return 0;
  }
};
