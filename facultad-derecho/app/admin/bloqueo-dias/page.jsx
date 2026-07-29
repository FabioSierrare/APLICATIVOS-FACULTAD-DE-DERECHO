"use client";

import { useState } from "react";
import DatePickerWithBlocks from "@/components/Calendario";
import useFetchData from "@/components/FetchData";
import { postData } from "@/components/FetchPost";
import { useUltimoCalendario } from "@/components/UltimoCalendario";
import {
  CalendarDays,
  CheckCircle,
  Trash2,
  Edit2,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { deleteData } from "@/components/Delete";

export default function PaginaReserva() {
  // Estado para la fecha que se está seleccionando actualmente
  const [selectedDate, setSelectedDate] = useState(null);
  const CalendarioUltimo = useUltimoCalendario();

  if (!CalendarioUltimo && CalendarioUltimo.id > 0)
    return (
      <div>
        <p>Cargando...</p>
      </div>
    );
  const { data: blockedDates, fetchData } = useFetchData(
    `/api/DiasBloqueo/GetDiasBloqueo/${CalendarioUltimo.id}`,
  );
  // Estado para la lista de fechas ya bloqueadas (Agregué algunas de ejemplo)
  const handleSelect = (date) => {
    if (typeof onSelect === "function") {
      onSelect(date);
    } else setSelectedDate(date);
  };


  const handleDeleteDate = (id) => {
    try{
      const respuesta = deleteData(`/api/DiasBloqueo/DeleteDiasBloqueo`, id)

      if(!respuesta){
        throw("Error de desbloqueo")
      }

      alert("Desbloqueo la fecha correctamente")
      fetchData();
    }catch(error){
      alert("Error al debloquear la fecha")
    }
  }
  const [loading, setLoading] = useState(false);

  // Bloquear la fecha seleccionada
  const handleBooking = () => {
    const Form = {
      CalendarioId: CalendarioUltimo.id,
      Fecha: selectedDate,
    };

    if (Form.CalendarioId.length === 0 || !Form.Fecha) {
      alert("Datos incompletos");
      return;
    }

    try {
      const respuesta = postData("/api/DiasBloqueo/PostDiasBloqueo", Form);

      if (!respuesta) {
        throw new Error("Error al bloquear los turnos");
      }
      alert("Bloqueo de Fecha exitoso");
      fetchData()
    } catch (error) {
      alert("Error al bloquear los turnos");
    }
  };

  if (!blockedDates) return;
  // Eliminar una fecha bloqueada

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans text-slate-800">
      {/* --- SECCIÓN SUPERIOR: CALENDARIO Y CONFIRMACIÓN --- */}
      <div className="max-w-5xl mx-auto mb-8">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row">
          {/* IZQUIERDA: Calendario */}
          <div className="w-full md:w-1/2 bg-indigo-900 p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600 rounded-full mix-blend-overlay filter blur-3xl opacity-20 translate-x-1/2 -translate-y-1/2"></div>

            <div className="relative z-10 mb-6">
              <h1 className="text-3xl font-bold mb-1">Agenda Enero 2026</h1>
              <p className="text-indigo-200 text-sm">
                Selecciona un día para bloquearlo.
              </p>
            </div>

            <div className="flex justify-center relative z-10">
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-2xl">
                {/* Tu componente */}
                <DatePickerWithBlocks
                  onSelect={handleSelect}
                  selected={selectedDate}
                />
              </div>
            </div>
          </div>

          {/* DERECHA: Acción */}
          <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-center bg-white relative">
            <div className="flex-1 flex flex-col justify-center">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <CheckCircle className="text-indigo-600" size={24} />
                Confirmar Selección
              </h2>

              {!selectedDate ? (
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-400 bg-slate-50">
                  <CalendarDays className="mx-auto mb-3 opacity-40" size={40} />
                  <p className="text-sm">
                    Toca un día en el calendario para comenzar
                  </p>
                </div>
              ) : (
                <div className="animate-in fade-in zoom-in duration-300">
                  <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 mb-6">
                    <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-1">
                      Día a bloquear
                    </p>
                    <p className="text-3xl font-bold text-slate-800">
                      {selectedDate.toString()}
                    </p>
                  </div>

                  <button
                    onClick={handleBooking}
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    {loading ? "Procesando..." : "Bloquear esta Fecha"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- NUEVA SECCIÓN: GESTIÓN DE FECHAS BLOQUEADAS --- */}
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-8">
          <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-xl font-bold text-slate-800">
                Gestión de Disponibilidad
              </h3>
              <p className="text-slate-500 text-sm">
                Administra los días que has marcado como no disponibles.
              </p>
            </div>
            <div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">
              {blockedDates.length} Bloqueados
            </div>
          </div>

          {blockedDates.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <AlertCircle className="mx-auto mb-3 text-slate-300" size={48} />
              <p>No hay fechas bloqueadas aún.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {blockedDates.map((date, index) => (
                <div
                  key={index}
                  className="group flex items-center justify-between bg-white border border-slate-200 p-4 rounded-2xl hover:shadow-md hover:border-indigo-200 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-700">
                        {new Date(date.fecha).toLocaleDateString("es-CO")}
                      </p>
                      <p className="text-xs text-slate-400">No disponible</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    
                    {/* Botón Eliminar */}
                    <button
                      onClick={() => handleDeleteDate(date.id)}
                      title="Desbloquear fecha"
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
