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

/**
 * DatePickerWithBlocks (CORREGIDO)
 * - normaliza fechas (startOfDay) para evitar problemas de zona horaria
 * - bloquea fechas específicas
 * - bloquea todos los martes
 * - funciona si el padre controla selected/onSelect o si no (fallback interno)
 *
 * Props:
 * - blockedDates: array de strings ISO ('YYYY-MM-DD') o Date
 * - selected: Date | undefined
 * - mode: 'single' | 'multiple' | 'range'
 * - onSelect: función => actualiza el padre
 */
export default function DatePickerWithBlocks({
  blockedDates = [],
  selected = undefined,
  mode = "single",
  onSelect = undefined,
  onLoadCalendario = undefined,
  className = "",
}) {
  const [internalSelected, setInternalSelected] = useState(undefined);
  const selectedValue =
    typeof selected === "undefined" ? internalSelected : selected;
  const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
  const { data: calendarios } = useFetchData("/api/Calendarios/GetCalendarios");
  const [calendario, setCalendario] = useState(null);
  const [festivo, setFestivos] = useState(null);
  const [mesVisible, setMesVisible] = useState(new Date());
  const today = new Date();
  const inicioSemana = startOfWeek(today, { weekStartsOn: 1 });
  const finSemana = endOfWeek(today, { weekStartsOn: 1 });

  useEffect(() => {
    const cargarFestivos = async () => {
      const año = mesVisible.getFullYear();
      const mes = mesVisible.getMonth() + 1;
      setFestivos(await obtenerCalendarioHabilColombia(año, mes));
    };

    cargarFestivos();
  }, [mesVisible]);

  const handleMonthChange = (month) => {
    setMesVisible(month);
  };

  useEffect(() => {
    if (!calendarios || !Array.isArray(calendarios) || calendarios.length === 0)
      return;
    const ultimo = calendarios[calendarios.length - 1];
    setCalendario(ultimo);

    if (typeof onLoadCalendario === "function") {
      onLoadCalendario(ultimo);
    }
  }, [calendarios]);

  const handleSelect = (date) => {
    if (typeof onSelect === "function") {
      onSelect(date);
    } else setInternalSelected(date);
  };

  // Normaliza y guarda fechas bloqueadas como startOfDay(Date)
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
        // elimina duplicados
        .filter((v, i, a) => a.findIndex((x) => isSameDay(x, v)) === i),
    [blockedDates]
  );

  // Función que revisa si una fecha está bloqueada:
  const isBlocked = (date) => {
    const day = startOfDay(date); // aseguramos 00:00 local

    // Bloqueos personalizados desde festivos
    if (day.getDay() === festivo.fecha) return true;
    //bloquea el domingo
    if (day.getDay() === 0) return true;
    //bloquea el sabado
    if (day.getDay() === 6) return true;
    // 1) Si es martes -> bloquear (2 = martes)
    if (day.getDay() === diasSemana.indexOf(calendario.diaConciliacion) + 1)
      return true;
    // Bloquear días fuera del rango del calendario
    //antes de la fecha de inicio
    if (calendario && day < startOfDay(parseISO(calendario.fechaInicio)))
      return true;
    //después de la fecha de fin
    if (calendario && day > startOfDay(parseISO(calendario.fechaFin)))
      return true;
    // Bloquear días de esta semana
    if (calendario && day >= inicioSemana && day <= finSemana) return true;

    if (calendario && day <= today) return true;

    // 2) Si coincide con alguna fecha bloqueada -> bloquear
    for (const bd of blockedNormalized) {
      if (isSameDay(day, bd)) return true;
    }

    for (const f of festivo) {
      if (f.esFestivo && isSameDay(day, parseISO(f.fecha))) return true;
    }

    return false;
  };

  // Usamos modifiers para marcar visualmente los bloqueados y disabled como matcher de función
  const modifiers = { blocked: blockedNormalized }; // usados para estilos
  const modifiersClassNames = {
    blocked: "bg-red-100 text-red-800 line-through",
    selected: "bg-green-600 rounded-xl text-white",
    today: "border-none rounded-xl",
    left: "black",
  };

  if (!calendario || !festivo) return <p>Esperando...</p>;

  // Limpiar selección
  const limpiar = () => {
    if (typeof onSelect === "function") onSelect(undefined);
    else setInternalSelected(undefined);
  };

  const classNames = {
    nav: "flex items-center justify-between bg-green-100 p-2 rounded-xl",
    button_previous: "text-green-700 hover:text-green-900 transition",
    button_next: "text-green-700 hover:text-green-900 transition",
    caption_label: "text-green-800 font-semibold",
  };

  return (
    <div
      className={`xs:p-2 p-0 rounded-2xl shadow-lg border-white border-2 bg-primary flex flex-col xs:max-w-85 max-w-full ${className} uppercase`}
    >
      <DayPicker
        locale={es}
        mode={mode}
        className={"m-auto max-w-80 xs:p-2 text-white bg-primary"}
        selected={selectedValue}
        onSelect={handleSelect}
        navLayout="around"
        // disabled acepta matchers — aquí usamos función matcher
        disabled={isBlocked}
        modifiers={modifiers}
        modifiersClassNames={modifiersClassNames}
        month={mesVisible}
        onMonthChange={handleMonthChange}
      />
    </div>
  );
}
