"use client";

import React, { useState, useMemo, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import { es } from "date-fns/locale";
import {
  parseISO,
  startOfDay,
  isSameDay,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import "react-day-picker/dist/style.css";
import Holidays from "date-holidays";

import useFetchData from "@/components/FetchData";
import { obtenerCalendarioHabilColombia } from "@/components/DiasMesColombia";
import { useUsuarioTurno } from "./UsuarioData";

export default function DatePickerWithBlocksStudent({
  blockedDates = [],
  selected = undefined,
  mode = "single",
  onSelect = undefined,
  onLoadCalendario = undefined,
  className = "",
}) {
  const [internalSelected, setInternalSelected] = useState(undefined);
  const selectedValue = selected ?? internalSelected;
  const { usuarioId, consultorioId, calendarioId } = useUsuarioTurno();
  const { data: informacionCompleta } = useFetchData(
    calendarioId ? `/api/CalendarioBloqueo/GetCalendarioBloqueo/${calendarioId}` : null
  );
  const [LimitesTurnos, setLimitesTurnos] = useState();
  const [Turnos, setTurnos] = useState();
  const [configuracionDias, setConfiguracionDias] = useState();
  const [DiasBloqueo, setDiasBloqueo] = useState();  

  const [calendario, setCalendario] = useState(null);
  const [festivo, setFestivos] = useState(null);

  const [mesVisible, setMesVisible] = useState(new Date());

  const today = startOfDay(new Date());
  const inicioSemana = startOfWeek(today, { weekStartsOn: 1 });
  const finSemana = endOfWeek(today, { weekStartsOn: 1 });

  // Cargar festivos
  useEffect(() => {
    const año = mesVisible.getFullYear();
    const mes = mesVisible.getMonth() + 1;
    setFestivos(obtenerCalendarioHabilColombia(año, mes));
  }, [mesVisible]);

  const handleMonthChange = (month) => {
    setMesVisible(startOfDay(month));
  };

  // Cargar calendario activo
  useEffect(() => {
    if (!informacionCompleta || informacionCompleta.length === 0) return;

    const ultimo = informacionCompleta.calendario
    setCalendario(ultimo);
    setLimitesTurnos(informacionCompleta.limitesTurnosConsultorio)
    setTurnos(informacionCompleta.turnos)
    setConfiguracionDias(informacionCompleta.configuracionDias)
    setDiasBloqueo(informacionCompleta.diasBloqueo)

    if (onLoadCalendario) onLoadCalendario(ultimo);
  }, [informacionCompleta]);

  // Función para formatear fechas (consistente con useCalendar)
  const formatearFecha = (fecha) => new Date(fecha).toISOString().split("T")[0];

  const getDisponibilidadJornada = (day) => {
    const fechaNormalizada = formatearFecha(day);

    const diaSemanaMinuscula = day
      .toLocaleDateString("es-ES", { weekday: "long" })
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

    const configDia = configuracionDias?.find(
      (c) =>
        c.calendarioId === calendarioId &&
        c.diaSemana
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase() === diaSemanaMinuscula,
    ) || { maxTurnosAM: Infinity, maxTurnosPM: Infinity };

    const turnosAM =
      Turnos?.filter(
        (t) =>
          t.calendarioId === calendarioId &&
          t.jornada === "AM" &&
          formatearFecha(t.fecha) === fechaNormalizada,
      ).length || 0;

    const turnosPM =
      Turnos?.filter(
        (t) =>
          t.calendarioId === calendarioId &&
          t.jornada === "PM" &&
          formatearFecha(t.fecha) === fechaNormalizada,
      ).length || 0;

    return {
      AM: turnosAM < configDia.maxTurnosAM,
      PM: turnosPM < configDia.maxTurnosPM,
    };
  };

  // =========================
  // 🚀 handleSelect INTEGRADO
  // =========================

  const handleSelect = (date) => {
    if (!date) return;

    const disponibilidad = getDisponibilidadJornada(date);

    // Si NO hay AM NI PM -> Bloqueado, no seleccionar
    if (!disponibilidad.AM && !disponibilidad.PM) return;

    const resultado = {
      date,
      disponibilidad,
    };

    if (onSelect) onSelect(resultado);
    else setInternalSelected(resultado);
  };

  

  // Normalizar fechas bloqueadas
  const blockedNormalized = useMemo(
    () =>
      blockedDates
        .map((d) => {
          try {
            if (typeof d === "string") return startOfDay(parseISO(d));
            return startOfDay(new Date(d));
          } catch {
            return startOfDay(new Date(d));
          }
        })
        .filter((v, i, arr) => arr.findIndex((x) => isSameDay(x, v)) === i),
    [blockedDates],
  );

  // ===============================
  // 🚀 **BLOQUEOS PRINCIPALES** (INTEGRADOS)
  // ===============================
  // Llamamos siempre al hook para mantener el orden de los Hooks (pasamos null si no hay calendarioId)
  

  if (!calendarioId) return <p>Cargando datos del usuario…</p>;

  const isBlocked = (date) => {
    const day = startOfDay(date);

    if (
      !festivo ||
      !calendario ||
      !Turnos ||
      !LimitesTurnos ||
      !configuracionDias ||
      !calendarioId
    )
      return true;

    // Bloqueo: max turnos alcanzados (global)
    const limite =
      LimitesTurnos?.find(
        (l) =>
          l.consultorioId === consultorioId && l.calendarioId === calendarioId,
      )?.limiteTurnos || Infinity;

    const totalTurnos =
      Turnos?.filter(
        (t) => t.usuarioId === usuarioId && t.calendarioId === calendarioId,
      ).length || 0;

    if (limite <= totalTurnos) return true;

    // Bloqueo: usuario ya tiene turno en este día
    const tieneTurnoElUsuario = Turnos?.some(
      (t) =>
        t.usuarioId === usuarioId &&
        t.calendarioId === calendarioId &&
        formatearFecha(t.fecha) === formatearFecha(day),
    );

    if (tieneTurnoElUsuario) return true;

    // Bloqueo: max turnos alcanzado por día (AM/PM) basado en jornadaSeleccionada
    const diaSemanaMinuscula = day
      .toLocaleDateString("es-ES", { weekday: "long" })
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

    const configDia = configuracionDias?.find(
      (c) =>
        c.calendarioId === calendarioId &&
        c.diaSemana
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase() === diaSemanaMinuscula,
    ) || { maxTurnosAM: Infinity, maxTurnosPM: Infinity };

    const turnosAM =
      Turnos?.filter(
        (t) =>
          t.calendarioId === calendarioId &&
          t.jornada === "AM" &&
          formatearFecha(t.fecha) === formatearFecha(day),
      ).length || 0;

    const turnosPM =
      Turnos?.filter(
        (t) =>
          t.calendarioId === calendarioId &&
          t.jornada === "PM" &&
          formatearFecha(t.fecha) === formatearFecha(day),
      ).length || 0;

    //Bloqueo por si ya cumplio con el total de turnos para ese dia
    if (turnosAM >= configDia.maxTurnosAM && turnosPM >= configDia.maxTurnosPM)
      return true;

    // Bloqueo: Sábado (6) y Domingo (0)
    if (day.getDay() === 0 || day.getDay() === 6) return true;

    // Bloqueo: día de conciliación
    if (
      day.getDay() ===
      [
        "Domingo",
        "Lunes",
        "Martes",
        "Miércoles",
        "Jueves",
        "Viernes",
        "Sábado",
      ].indexOf(calendario.diaConciliacion)
    ) {
      return true;
    }

    // Bloqueo: antes de fechaInicio
    if (day < startOfDay(parseISO(calendario.fechaInicio))) return true;

    // Bloqueo: después de fechaFin
    if (day > startOfDay(parseISO(calendario.fechaFin))) return true;

    // Bloqueo: días de esta semana
    if (day >= inicioSemana && day <= finSemana) return true;

    // Bloqueo: días iguales o menores que hoy
    if (day <= today) return true;

    // Bloqueo: calendario desactivado
    if (calendario.estado === "Desactivado") return true;

    // Bloqueo: fechas manuales
    for (const bd of blockedNormalized) {
      if (isSameDay(day, bd)) return true;
    }

    // Bloqueo: festivos
    for (const f of festivo) {
      if (f.esFestivo && isSameDay(day, parseISO(f.fecha))) return true;
    }

    if (!DiasBloqueo || DiasBloqueo.length === 0) {
      return false;
    }

    for (const fecha of DiasBloqueo) {
      if (calendario && isSameDay(day, startOfDay(parseISO(fecha.fecha))))
        return true;
    }

    return false;
  };

  const modifiers = { blocked: blockedNormalized };
  const modifiersClassNames = {
    blocked: "bg-red-100 text-red-800 line-through",
    selected: "bg-green-600 rounded-xl text-white",
    today: "border-none rounded-xl",
  };

  if (!calendario || !festivo || !DiasBloqueo || !informacionCompleta) return <p>Cargando calendario…</p>;
  return (
    <div
      className={`xs:p-2 p-0 rounded-2xl shadow-lg border-white border-2 bg-primary flex flex-col xs:max-w-85 max-w-full ${className}`}
    >
      <DayPicker
        locale={es}
        mode={mode}
        className={"m-auto max-w-80 xs:p-2 text-white bg-primary"}
        selected={selectedValue?.date}
        onSelect={handleSelect}
        navLayout="around"
        disabled={isBlocked}
        modifiers={modifiers}
        modifiersClassNames={modifiersClassNames}
        month={mesVisible}
        onMonthChange={handleMonthChange}
      />
    </div>
  );
}
