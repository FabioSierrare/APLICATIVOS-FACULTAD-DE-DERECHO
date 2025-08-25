// hooks/useUsuarioTurno.js
"use client";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import useFetchData from "@/components/FetchData";

export const useUsuarioTurno = () => {
  const [decoded, setDecoded] = useState(null);
  const [usuarioId, setUsuarioId] = useState(null);
  const [consultorioId, setConsultorioId] = useState(null);
  const [calendarioId, setCalendarioId] = useState(null);

  // 1️⃣ Decodificar token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const d = jwtDecode(token);
      setDecoded(d);
      setUsuarioId(parseInt(d.Id));
    }
  }, []);

  // 2️⃣ Traer consultorios
  const { data: consultorios } = useFetchData(
    decoded ? "/api/UsuarioConsultorios/GetUsuarioConsultorio" : null
  );

  useEffect(() => {
    if (!usuarioId || !consultorios) return;
    const userConsultorio = consultorios.find((u) => u.usuarioId === usuarioId);
    if (userConsultorio) setConsultorioId(userConsultorio.consultorioId);
  }, [usuarioId, consultorios]);

  // 3️⃣ Traer último calendario
  const { data: calendarios } = useFetchData("/api/Calendarios/GetCalendarios");

  useEffect(() => {
    if (!calendarios || !Array.isArray(calendarios) || calendarios.length === 0)
      return;
    const ultimo = calendarios[calendarios.length - 1];
    setCalendarioId(ultimo.id);
  }, [calendarios]);

  return { decoded, usuarioId, consultorioId, calendarioId };
};
