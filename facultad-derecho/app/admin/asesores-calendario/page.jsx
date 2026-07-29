"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Trash2,
  Plus,
  Save,
  UserPlus,
  ChevronDown,
  Calendar,
  CaseUpper,
  Clock,
} from "lucide-react";

import useFetchData from "@/components/FetchData";
import { useUltimoCalendario } from "@/components/UltimoCalendario";
import { PutData } from "@/components/FetchPut";
import { env } from "process";

export default function AdvisorScheduler() {
  const calendario = useUltimoCalendario();
  const { data: asesores } = useFetchData(
    "/api/Usuarios/GetUsuariosProfesores",
  );
  const { data: consultorioProfesores } = useFetchData(
    "/api/ConsultorioProfesores/GetConsultorioProfesores",
  );
  const router = useRouter()


  const DAYS_OF_WEEK = ["LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES"];

  // Estado inicial
  const [schedule, setSchedule] = useState({
    LUNES: [],
    MARTES: [],
    MIÉRCOLES: [],
    JUEVES: [],
    VIERNES: [],
  });

  const capitalizeFirstLetter = (string) => {
    if (string.length === 0) {
      return "";
    }
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  useEffect(() => {
  if (asesores && consultorioProfesores && calendario) {
    const newSchedule = {
      LUNES: [],
      MARTES: [],
      MIÉRCOLES: [],
      JUEVES: [],
      VIERNES: [],
    };

    consultorioProfesores
      .filter((cp) => cp.calendarioId === calendario.id) // 🔥 FILTRO CLAVE
      .forEach((cp) => {
        const profesor =
          asesores.find((as) => as.id === cp.profesorId)?.nombre || "";

        const dia = cp.diaSemana.toUpperCase();

        if (newSchedule[dia]) {
          newSchedule[dia].push({
            id: cp.id,
            nombre: profesor,
            profesorId: cp.profesorId,
            diaSemana: cp.diaSemana,
            jornada: cp.jornada,
          });
        }
      });

    setSchedule(newSchedule);
  }
}, [asesores, consultorioProfesores, calendario]);

  // Añadir una fila vacía
  const addAdvisorRow = (day) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: [
        ...prev[day],
        {
          id: crypto.randomUUID(),
          nombre: "",
          profesorId: 0,
          diaSemana: "",
          jornada: "",
        },
      ],
    }));
  };

  // Eliminar una fila
  const removeAdvisorRow = (day, slotId) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: prev[day].filter((slot) => slot.id !== slotId),
    }));
  };

  // Actualizar la selección del asesor (permite mismo profesor en distinta jornada)
  const updateAdvisor = (day, slotId, newAdvisorId) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: prev[day].map((slot) => {
        if (slot.id !== slotId) return slot;
        const parsedId = parseInt(newAdvisorId);
        const selectedSlot = schedule[day].find((s) => s.id === slotId) || {};
        const jornadaSeleccionada = selectedSlot.jornada || "";
        // Evita duplicar el mismo profesor en la misma jornada
        const existe = schedule[day].some(
          (sc) =>
            sc.profesorId === parsedId &&
            (sc.jornada === jornadaSeleccionada || (!sc.jornada && !jornadaSeleccionada))
        );
        if (existe) {
          // No actualizar si ya existe (podrías mostrar una alerta si lo deseas)
          return slot;
        }
        return {
          ...slot,
          profesorId: parsedId,
          diaSemana: capitalizeFirstLetter(day.toLowerCase()),
        };
      }),
    }));
  };

  const updateField = (day, slotId, field, value) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: prev[day].map((slot) => {
        if (slot.id !== slotId) return slot;
        // Si se está cambiando la jornada y ya hay otro registro con el mismo profesor y jornada, evitarlo
        if (field === "jornada" && slot.profesorId) {
          const existe = prev[day].some(
            (sc) => sc.id !== slotId && sc.profesorId === slot.profesorId && sc.jornada === value
          );
          if (existe) {
            alert("El profesor ya está asignado en esa jornada para este día.");
            return slot; // no aplicar cambio
          }
        }
        return slot.id === slotId ? { ...slot, [field]: value } : slot;
      }),
    }));
  };

  // Simular guardar
  const handleSave = async () => {
    const contenido = Object.values(schedule)
      .flat()
      .filter((slot) => slot.profesorId && slot.diaSemana)
      .map(({ profesorId, diaSemana, jornada }) => ({
        ProfesorId: profesorId,
        DiaSemana: diaSemana,
        Jornada: jornada || "AM",
      }));

    const Enviar = {
      CalendarioId: calendario.id,
      Profesores: contenido,
    };

    try {
      const respuesta = await PutData(
        "/api/ConsultorioProfesores/UpdateConsultorioProfesores",
        Enviar,
      );

      if (!respuesta) {
        throw new Error("Error al guardar al asesor");
      }

      alert("Asesores actualizados correctamente");
    } catch (error) {
      alert("Ocurrió un error al guardar al asesor");
    }
  };

  if (
    !calendario ||
    calendario.length === 0 ||
    !asesores ||
    !consultorioProfesores
  )
    return <div>Cargando...</div>;
  const diaConciliacion = calendario.diaConciliacion;

  const consultorioProfesoresNombrados = consultorioProfesores.map((cp) => {
    const nombre = asesores.find((as) => as.id === cp.profesorId).nombre;

    return {
      ...cp,
      nombre,
    };
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-24 text-gray-800 font-sans">
      {/* HEADER SUPERIOR */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-600" />
            <h1 className="text-xl font-bold text-gray-900">
              Asignación de Asesores
            </h1>
          </div>

          {/* Botón Acceso Directo: Registrar */}
          <button
            onClick={() => router.push("/admin/usuarios/registro-asesores")}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Registrar Nuevo Asesor</span>
            <span className="sm:hidden">Nuevo</span>
          </button>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL (GRILLA) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {DAYS_OF_WEEK.filter((d) => d != diaConciliacion.toUpperCase()).map(
            (day) => (
              <div
                key={day}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex h-full min-h-[180px]"
              >
                {/* Barra Lateral del Día (Vertical) */}
                <div className="bg-indigo-600 text-white w-12 flex items-center justify-center shrink-0">
                  <span className="font-bold tracking-widest text-sm transform -rotate-90 whitespace-nowrap uppercase">
                    {day}
                  </span>
                </div>

                {/* Área de Contenido */}
                <div className="flex-1 flex flex-col p-4">
                  <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Asesor
                    </span>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Opción
                    </span>
                  </div>

                  <div className="flex-1 space-y-3">
                    {schedule[day].length === 0 && (
                      <p className="text-sm text-gray-400 italic text-center py-4">
                        Sin asignaciones
                      </p>
                    )}

                    {schedule[day].map((slot) => (
                      <div key={slot.id} className="flex gap-2 items-center">
                        <div className="relative flex-1">
                          <select
                            value={slot.profesorId}
                            onChange={(e) =>
                              updateAdvisor(day, slot.id, e.target.value)
                            }
                            className="w-full appearance-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 pr-8"
                          >
                            <option value="">Seleccionar...</option>
                            {asesores.map((adv) => (
                              <option key={adv.id} value={adv.id}>
                                {adv.nombre}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-2.5 top-3 w-4 h-4 text-gray-500 pointer-events-none" />
                        </div>

                        <div className="col-span-3 relative">
                          <select
                            value={slot.jornada}
                            onChange={(e) =>
                              updateField(
                                day,
                                slot.id,
                                "jornada",
                                e.target.value,
                              )
                            }
                            className="w-full appearance-none bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold rounded-lg p-2 text-xs focus:ring-2 focus:ring-indigo-500 outline-none pr-7"
                          >
                            <option value="AM">AM</option>
                            <option value="PM">PM</option>
                          </select>
                          <Clock className="absolute right-2 top-2.5 w-3 h-3 text-indigo-400 pointer-events-none" />
                        </div>

                        <button
                          onClick={() => removeAdvisorRow(day, slot.id)}
                          className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => addAdvisorRow(day)}
                    className="mt-4 flex items-center justify-center gap-2 w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Añadir asesor
                  </button>
                </div>
              </div>
            ),
          )}
        </div>
      </main>

      {/* BARRA FLOTANTE DE GUARDADO */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-20">
        <div className="max-w-7xl mx-auto flex justify-end items-center gap-4">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow-md transition-all"
          >
            <Save className="w-5 h-5" />
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
}
