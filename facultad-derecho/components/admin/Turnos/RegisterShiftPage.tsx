"use client";

import React, { useState } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Info,
  User,
  Clock,
  X,
  Plus,
  Users,
  Building2,
} from "lucide-react";

export default function RegisterShiftPage() {
  const [selectedDay, setSelectedDay] = useState<number>(13);
  const [selectedStudent, setSelectedStudent] =
    useState<string>("FABIO SIERRA");
  const [selectedShift, setSelectedShift] =
    useState<string>("AM - 08:00 - 12:00");

  // Días del mes de Agosto 2026 (Comienza en Sábado)
  const calendarDays = [
    null,
    null,
    null,
    null,
    null,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    13,
    14,
    15,
    16,
    17,
    18,
    19,
    20,
    21,
    22,
    23,
    24,
    25,
    26,
    27,
    28,
    29,
    30,
    31,
  ];

  // Datos mock de la tabla según el día seleccionado
  const [shiftsTable] = useState([
    {
      id: 1,
      estudiante: "MARÍA PAULA GONZÁLEZ",
      consultorio: "Consultorio 1",
      jornada: "AM - 08:00 - 12:00",
    },
    {
      id: 2,
      estudiante: "JUAN CAMILO RODRÍGUEZ",
      consultorio: "Consultorio 2",
      jornada: "PM - 14:00 - 18:00",
    },
    {
      id: 3,
      estudiante: "FABIO SIERRA",
      consultorio: "Consultorio 3",
      jornada: "AM - 08:00 - 12:00",
    },
  ]);

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8 flex items-center justify-center font-sans text-slate-800">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        {/* ================= ENCABEZADO PÚRPURA ================= */}
        <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-800 text-white p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 opacity-15 pointer-events-none">
            <CalendarIcon className="w-48 h-48 text-white" />
          </div>

          <div className="flex items-center space-x-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-300/30 flex items-center justify-center text-amber-300 shadow-inner">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">
                Registro de Turno
              </h1>
              <p className="text-xs sm:text-sm text-purple-200 mt-0.5">
                Completa la información para agendar tu turno de consultorio.
              </p>
            </div>
          </div>
        </div>

        {/* ================= CUERPO DEL FORMULARIO ================= */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* 1. SELECCIONAR FECHA */}
          <section className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-7 h-7 rounded-full bg-purple-800 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                1
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-1">
                  Selecciona la fecha del turno{" "}
                  <span className="text-red-500">*</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Elige el día en el que deseas agendar tu turno.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start pl-0 sm:pl-10">
              {/* Widget del Calendario */}
              <div className="md:col-span-6 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <button className="p-1.5 hover:bg-slate-100 rounded-lg text-indigo-900 transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="font-extrabold text-indigo-950 text-base">
                    Agosto 2026
                  </span>
                  <button className="p-1.5 hover:bg-slate-100 rounded-lg text-indigo-900 transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-7 text-center text-[11px] font-bold text-slate-400 mb-2">
                  <span>LU</span>
                  <span>MA</span>
                  <span>MI</span>
                  <span>JU</span>
                  <span>VI</span>
                  <span>SÁ</span>
                  <span>DO</span>
                </div>

                <div className="grid grid-cols-7 text-center text-xs gap-y-1 font-semibold">
                  {calendarDays.map((day, idx) => {
                    if (!day) return <div key={idx} />;
                    const isSelected = selectedDay === day;

                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedDay(day)}
                        className={`h-9 w-9 mx-auto flex items-center justify-center rounded-full transition-all ${
                          isSelected
                            ? "bg-emerald-500 text-white font-bold shadow-md shadow-emerald-200"
                            : "text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tarjeta de Fecha Seleccionada */}
              <div className="md:col-span-6 bg-purple-50/60 border border-purple-100 rounded-2xl p-5 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 text-purple-800 rounded-xl">
                    <CalendarIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-600">
                      Fecha seleccionada
                    </p>
                    <p className="text-sm font-extrabold text-indigo-950 mt-0.5">
                      Jueves, {selectedDay} de agosto de 2026
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-purple-100/80 flex items-start space-x-2 text-xs text-slate-600">
                  <Info className="w-4 h-4 text-purple-700 flex-shrink-0 mt-0.5" />
                  <span>
                    Los días en gris no tienen disponibilidad de turnos.
                  </span>
                </div>
              </div>
            </div>

            {/* TABLA DE TURNOS PROGRAMADOS PARA EL DÍA SELECCIONADO */}
            <div className="pl-0 sm:pl-10 pt-2">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-purple-800" />
                    <span className="text-xs font-bold text-slate-800">
                      Turnos agendados ({selectedDay} de agosto)
                    </span>
                  </div>
                  <span className="text-[11px] bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full font-bold">
                    {shiftsTable.length} asignados
                  </span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-indigo-950 text-white text-[11px] font-semibold">
                        <th className="p-2.5 pl-3">Nombre del estudiante</th>
                        <th className="p-2.5">Consultorio</th>
                        <th className="p-2.5 pr-3">Jornada</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {shiftsTable.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="p-2.5 pl-3 font-semibold text-slate-800">
                            {item.estudiante}
                          </td>
                          <td className="p-2.5 text-slate-600">
                            <span className="inline-flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-slate-400" />
                              {item.consultorio}
                            </span>
                          </td>
                          <td className="p-2.5 pr-3 text-slate-600">
                            <span className="inline-flex items-center gap-1 font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                              <Clock className="w-3 h-3 text-purple-700" />
                              {item.jornada}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          {/* 2. SELECCIONAR ESTUDIANTE */}
          <section className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-7 h-7 rounded-full bg-purple-800 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                2
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-1">
                  Seleccione el estudiante{" "}
                  <span className="text-red-500">*</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Elige el estudiante que realizará el turno.
                </p>
              </div>
            </div>

            <div className="pl-0 sm:pl-10">
              <div className="relative flex items-center border border-slate-200 rounded-2xl bg-white p-2 shadow-sm hover:border-slate-300 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-800 flex items-center justify-center mr-3 flex-shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full bg-transparent text-sm font-bold text-slate-800 focus:outline-none cursor-pointer appearance-none pr-8"
                >
                  <option value="FABIO SIERRA">FABIO SIERRA</option>
                  <option value="MARÍA PAULA GONZÁLEZ">
                    MARÍA PAULA GONZÁLEZ
                  </option>
                  <option value="JUAN CAMILO RODRÍGUEZ">
                    JUAN CAMILO RODRÍGUEZ
                  </option>
                </select>
                <div className="absolute right-4 pointer-events-none text-slate-500 text-xs">
                  ▼
                </div>
              </div>
            </div>
          </section>

          {/* 3. JORNADA */}
          <section className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-7 h-7 rounded-full bg-purple-800 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                3
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-1">
                  Jornada <span className="text-red-500">*</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Selecciona la jornada en la que deseas agendar tu turno.
                </p>
              </div>
            </div>

            <div className="pl-0 sm:pl-10 space-y-3">
              <div className="relative flex items-center border border-slate-200 rounded-2xl bg-white p-2 shadow-sm hover:border-slate-300 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-800 flex items-center justify-center mr-3 flex-shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <select
                  value={selectedShift}
                  onChange={(e) => setSelectedShift(e.target.value)}
                  className="w-full bg-transparent text-sm font-bold text-slate-800 focus:outline-none cursor-pointer appearance-none pr-8"
                >
                  <option value="AM - 08:00 - 12:00">AM - 08:00 - 12:00</option>
                  <option value="PM - 14:00 - 18:00">PM - 14:00 - 18:00</option>
                </select>
                <div className="absolute right-4 pointer-events-none text-slate-500 text-xs">
                  ▼
                </div>
              </div>

              {/* Banner Informativo Horario */}
              <div className="bg-purple-50/60 border border-purple-100 rounded-2xl p-3.5 flex items-center space-x-3 text-xs text-slate-600">
                <Info className="w-4 h-4 text-purple-700 flex-shrink-0" />
                <span>Horario disponible: 08:00 a.m. a 12:00 p.m.</span>
              </div>
            </div>
          </section>
        </div>

        {/* ================= BOTONES ACCIÓN INFERIORES ================= */}
        <div className="bg-slate-50 border-t border-slate-100 p-4 sm:p-6 flex items-center justify-end space-x-3">
          <button className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors shadow-sm">
            <X className="w-4 h-4" />
            <span>Cancelar</span>
          </button>

          <button className="flex items-center space-x-1.5 px-6 py-2.5 rounded-xl bg-purple-800 hover:bg-purple-900 text-white font-bold text-xs transition-colors shadow-md shadow-purple-200">
            <Plus className="w-4 h-4" />
            <span>Añadir Turno</span>
          </button>
        </div>
      </div>
    </div>
  );
}
