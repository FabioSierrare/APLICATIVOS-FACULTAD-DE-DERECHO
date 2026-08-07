"use client";

import { useState, useEffect } from "react";
import { Calendar, Search, Plus, Edit2, Trash2, CalendarDays, ArrowUpDown } from "lucide-react";
import useFetchData from "@/components/FetchData";
import { deleteData } from "@/components/Delete";
import CalendarSkeleton from "@/components/cargando";
import { useRouter } from "next/navigation";
import { PutData } from "@/components/FetchPut";

export default function App() {
  const { data: calendario, fetchData } = useFetchData(
    "/api/Calendarios/GetCalendarios"
  );

  const router = useRouter();

  // HOOKS SIEMPRE ARRIBA
  const [calendarios, setCalendarios] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Cuando cargue `calendario`, sincronizar estado
  useEffect(() => {
    if (calendario) {
      setCalendarios(calendario);
    }
  }, [calendario]);

  // LÓGICA DESPUÉS DE HOOKS
  if (!calendario) return <CalendarSkeleton />;

  // Toggle de estado
  const toggleEstado = async (id) => {
    const item = calendarios.find((x) => x.id === id);
    if (!item) return;

    const nuevoEstado = item.estado === "Activo" ? "Desactivado" : "Activo";

    const enviar = {
      Id: item.id,
      Anio: item.anio,
      Semestre: item.semestre,
      FechaInicio: new Date(item.fechaInicio),
      FechaFin: new Date(item.fechaFin),
      DiaConciliacion: item.diaConciliacion,
      Estado: nuevoEstado,
    };

    try {
      const respuesta = await PutData(`/api/Calendarios/PutCalendarios/${enviar.Id}`, enviar);

      if (!respuesta) {
        throw new Error("Error al guardar los datos");
      }

      setCalendarios((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, estado: nuevoEstado } : item
        )
      );
    } catch (error) {
      alert("Ocurrió un error al actualizar el componente");
    }
  };

  const Eliminar = async (id) => {
    try {
      const respuesta = await deleteData(`/api/Calendarios/DeleteCalendarios`, id);
      if (!respuesta) {
        throw new Error("Error al eliminar calendario");
      }

      await fetchData();
    } catch (error) {
      alert("Ocurrió un error al eliminar el calendario");
    }
  };

  const InfoCalendario = (id) => {
    router.push(`/admin/calendarios-creados/${id}`);
  };

  const filteredData = calendarios.filter(
    (item) =>
      item.semestre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.anio.toString().includes(searchTerm)
  ).reverse();

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* ================= HEADER ================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-[#553285]/10 text-[#553285] flex items-center justify-center flex-shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-[#553285] tracking-tight">
                Gestión de Calendarios
              </h1>
              <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                Administra los periodos académicos y sus estados de conciliación.
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push("/admin")}
            className="bg-[#553285] hover:bg-[#43266b] active:scale-[0.98] text-white px-5 py-2.5 rounded-xl shadow-sm hover:shadow flex items-center justify-center gap-2 transition-all text-sm font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Calendario</span>
          </button>
        </div>

        {/* ================= SEARCH & STATS ================= */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por semestre o año..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#553285]/20 focus:border-[#553285] transition-all placeholder:text-slate-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 bg-slate-100/70 px-3 py-1.5 rounded-lg self-end md:self-auto">
            <CalendarDays className="w-4 h-4 text-[#553285]" />
            <span>Total registros: {filteredData.length}</span>
          </div>
        </div>

        {/* ================= TABLA ================= */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Nombre / Semestre</th>
                  <th className="px-6 py-4">Fecha Inicio</th>
                  <th className="px-6 py-4">Fecha Fin</th>
                  <th className="px-6 py-4">Día Conciliación</th>
                  <th className="px-6 py-4 text-center">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {filteredData.length > 0 ? (
                  filteredData.map((item) => {
                    const isActivo = item.estado === "Activo";

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/60 transition-colors"
                      >
                        {/* Nombre */}
                        <td className="px-6 py-4 font-bold text-slate-900">
                          {item.semestre} {item.anio}
                        </td>

                        {/* Fecha Inicio */}
                        <td className="px-6 py-4 text-slate-600 font-medium whitespace-nowrap">
                          {new Date(item.fechaInicio).toLocaleDateString()}
                        </td>

                        {/* Fecha Fin */}
                        <td className="px-6 py-4 text-slate-600 font-medium whitespace-nowrap">
                          {new Date(item.fechaFin).toLocaleDateString()}
                        </td>

                        {/* Día Conciliación */}
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/60">
                            {item.diaConciliacion}
                          </span>
                        </td>

                        {/* Toggle Estado */}
                        <td className="px-6 py-4 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <button
                              onClick={() => toggleEstado(item.id)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                                isActivo ? "bg-[#553285]" : "bg-slate-300"
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                                  isActivo ? "translate-x-6" : "translate-x-1"
                                }`}
                              />
                            </button>
                            <span
                              className={`text-[10px] font-bold uppercase ${
                                isActivo ? "text-[#553285]" : "text-slate-400"
                              }`}
                            >
                              {isActivo ? "Activo" : "Inactivo"}
                            </span>
                          </div>
                        </td>

                        {/* Acciones */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => InfoCalendario(item.id)}
                              title="Editar / Ver detalle"
                              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => Eliminar(item.id)}
                              title="Eliminar"
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-slate-400 text-xs">
                      No se encontraron calendarios registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* FOOTER */}
          <div className="bg-slate-50/60 px-6 py-3.5 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>
              Mostrando <strong className="text-slate-800">{filteredData.length}</strong> resultados
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}