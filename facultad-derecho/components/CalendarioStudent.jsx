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

  const { data: calendarios } = useFetchData("/api/Calendarios/GetCalendarios");
  const { data: LimitesTurnos } = useFetchData(
    "/api/LimitesTurnosConsultorio/GetLimitesTurnosConsultorio"
  );
  const { data: Turnos } = useFetchData("/api/Turnos/GetTurnos");
  const { data: configuracionDias } = useFetchData(
    "/api/ConfiguracionDias/GetConfiguracionDias"
  );
  const { usuarioId, consultorioId, calendarioId } = useUsuarioTurno();

  const [calendario, setCalendario] = useState(null);
  const [festivo, setFestivos] = useState(null);

  const [mesVisible, setMesVisible] = useState(new Date());

  const today = startOfDay(new Date());
  const inicioSemana = startOfWeek(today, { weekStartsOn: 1 });
  const finSemana = endOfWeek(today, { weekStartsOn: 1 });

  // Cargar festivos
  useEffect(() => {
    const cargarFestivos = async () => {
      const año = mesVisible.getFullYear();
      const mes = mesVisible.getMonth() + 1;
      setFestivos(await obtenerCalendarioHabilColombia(año, mes));
    };

    cargarFestivos();
  }, [mesVisible]);

  const handleMonthChange = (month) => {
    setMesVisible(startOfDay(month));
  };

  // Cargar calendario activo
  useEffect(() => {
    if (!calendarios || calendarios.length === 0) return;

    const ultimo = calendarios[calendarios.length - 1];
    setCalendario(ultimo);

    if (onLoadCalendario) onLoadCalendario(ultimo);
  }, [calendarios]);

  // Función para formatear fechas (consistente con useCalendar)
  const formatearFecha = (fecha) => new Date(fecha).toISOString().split('T')[0];

 const getDisponibilidadJornada = (day) => {
  const fechaNormalizada = formatearFecha(day);

  const diaSemanaMinuscula = day
    .toLocaleDateString("es-ES", { weekday: "long" })
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  const configDia =
    configuracionDias?.find(
      (c) =>
        c.calendarioId === calendarioId &&
        c.diaSemana
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase() === diaSemanaMinuscula
    ) || { maxTurnosAM: Infinity, maxTurnosPM: Infinity };

  const turnosAM =
    Turnos?.filter(
      (t) =>
        t.calendarioId === calendarioId &&
        t.jornada === "AM" &&
        formatearFecha(t.fecha) === fechaNormalizada
    ).length || 0;

  const turnosPM =
    Turnos?.filter(
      (t) =>
        t.calendarioId === calendarioId &&
        t.jornada === "PM" &&
        formatearFecha(t.fecha) === fechaNormalizada
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
    [blockedDates]
  );

  // ===============================
  // 🚀 **BLOQUEOS PRINCIPALES** (INTEGRADOS)
  // ===============================
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
          l.consultorioId === consultorioId && l.calendarioId === calendarioId
      )?.limiteTurnos || Infinity;

    const totalTurnos =
      Turnos?.filter(
        (t) => t.usuarioId === usuarioId && t.calendarioId === calendarioId
      ).length || 0;

    if (limite <= totalTurnos) return true;

    // Bloqueo: usuario ya tiene turno en este día
    const tieneTurnoElUsuario = Turnos?.some(
      (t) =>
        t.usuarioId === usuarioId &&
        t.calendarioId === calendarioId &&
        formatearFecha(t.fecha) === formatearFecha(day)
    );

    if (tieneTurnoElUsuario) return true;

    // Bloqueo: max turnos alcanzado por día (AM/PM) basado en jornadaSeleccionada
    const diaSemanaMinuscula = day.toLocaleDateString('es-ES', { weekday: 'long' })
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

    const configDia = configuracionDias?.find(
      (c) =>
        c.calendarioId === calendarioId &&
        c.diaSemana
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase() === diaSemanaMinuscula
    ) || { maxTurnosAM: Infinity, maxTurnosPM: Infinity };


    const turnosAM =
      Turnos?.filter(
        (t) =>
          t.calendarioId === calendarioId &&
          t.jornada === "AM" &&
          formatearFecha(t.fecha) === formatearFecha(day)
      ).length || 0;

    const turnosPM =
      Turnos?.filter(
        (t) =>
          t.calendarioId === calendarioId &&
          t.jornada === "PM" &&
          formatearFecha(t.fecha) === formatearFecha(day)
      ).length || 0;
        

    //Bloqueo por si ya cumplio con el total de turnos para ese dia
    if(turnosAM >= configDia.maxTurnosAM && turnosPM >= configDia.maxTurnosPM) return true;


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

    return false;
  };

  const modifiers = { blocked: blockedNormalized };
  const modifiersClassNames = {
    blocked: "bg-red-100 text-red-800 line-through",
    selected: "bg-green-600 rounded-xl text-white",
    today: "border-none rounded-xl",
  };

  if (!calendario || !festivo) return <p>Cargando calendario…</p>;

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
