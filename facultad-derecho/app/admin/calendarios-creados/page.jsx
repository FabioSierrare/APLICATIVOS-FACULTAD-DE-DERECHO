"use client";

import { useState, useEffect } from "react";
import { Calendar, Search, Plus, Edit2, Trash2 } from "lucide-react";
import useFetchData from "@/components/FetchData";
import { deleteData } from "@/components/Delete";
import CalendarSkeleton from "@/components/cargando";
import { useRouter } from "next/navigation";

export default function App() {
  const { data: calendario, fetchData } = useFetchData(
    "/api/Calendarios/GetCalendarios"
  );

  const router = useRouter()

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
    // 1. Obtener el item actual
    const item = calendarios.find((x) => x.id === id);

    if (!item) return;

    // 2. Calcular el nuevo estado ANTES del setState
    const nuevoEstado = item.estado === "Activo" ? "Desactivado" : "Activo";

    // 3. Enviar a la API
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
      const respuesta = await fetch(`http://localhost:5031/api/Calendarios/PutCalendarios/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(enviar),
      });

      if (!respuesta) {
        throw new Error("Error al guardar los datos");
      }

      // 4. Actualizar UI solo cuando la API confirmó
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
      const respuesta = await deleteData(`/api/Calendarios/DeleteCalendarios`, id)
      if (!respuesta) {
        throw new Error("Error al eliminar calendario");
      }

      // 4. Actualizar UI solo cuando la API confirmó
     await fetchData()
    } catch (error) {
      alert("Ocurrió un error al eliminar el calendario");
    }
  }

  const filteredData = calendarios.filter(
    (item) =>
      item.semestre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.anio.toString().includes(searchTerm)
  ).reverse();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#553285] flex items-center gap-2">
              <Calendar className="w-8 h-8 text-[#FFCE21]" />
              Gestión de Calendarios
            </h1>
            <p className="text-gray-500 mt-1">
              Administra los periodos y estados de conciliación.
            </p>
          </div>

          <button onClick={() => router.push("/admin")} className="bg-[#553285] hover:bg-[#45276b] text-white px-4 py-2 rounded-lg shadow-sm flex items-center gap-2 transition-colors font-medium">
            <Plus className="w-4 h-4" />
            Nuevo Calendario
          </button>
        </div>

        {/* SEARCH BAR */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre de calendario..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#553285] focus:border-transparent transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Fecha Inicio
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Fecha Fin
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Día Conciliación
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredData.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {item.semestre} {item.anio}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {new Date(item.fechaInicio).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {new Date(item.fechaFin).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FFCE21]/20 text-[#553285] border border-[#FFCE21]/30">
                        {item.diaConciliacion}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => toggleEstado(item.id)}
                        className={`relative inline-flex h-6 w-11 cursor-pointer rounded-full transition-colors duration-200 ease-in-out ${
                          item.estado === "Activo"
                            ? "bg-[#553285]"
                            : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`absolute h-5 w-5 bg-white rounded-full shadow transform transition ${
                            item.estado === "Activo"
                              ? "translate-x-5"
                              : "translate-x-0"
                          }`}
                        />
                      </button>

                      <div className="mt-1 text-[10px] uppercase text-gray-400">
                        {item.estado === "Activo" ? "Activo" : "Inactivo"}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => Eliminar(item.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* FOOTER */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Mostrando{" "}
              <span className="font-medium">{filteredData.length}</span>{" "}
              resultados
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
