"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Trash2,
  User,
  Mail,
  FileText,
  FileUser,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import useFetchData from "@/components/FetchData";
import CalendarSkeleton from "@/components/cargando";
import { deleteData } from "@/components/Delete";
import { useRouter } from "next/navigation";

export default function GestionUsuarios() {
  // Datos simulados de Usuarios
  const { data: initialData, fetchData: fetchUsuarios } = useFetchData(
    "/api/Usuarios/GetUsuarios"
  );
  const { data: consultorio, fetchData: fetchConsultorio } = useFetchData(
    "/api/UsuarioConsultorios/GetUsuarioConsultorio"
  );

  const [usuarios, setUsuarios] = useState([]);

  // Router
  const router = useRouter();

  // Cuando llegan los datos, los guardas en el estado
  useEffect(() => {
    if (initialData) {
      setUsuarios(initialData);
    }
  }, [initialData]);

  const [searchTerm, setSearchTerm] = useState("");

  if (!initialData || !consultorio) return <CalendarSkeleton />;

  const contenido = usuarios
    .filter((u) => u.rolId === 2 || u.rolId === 3)
    .map((u) => {
      const cst = consultorio.find((c) => c.usuarioId === u.id);

      return {
        ...u,
        consultorioId: cst ? cst.consultorioId : 0,
        consultorio: cst ? cst.consultorioId : "Docente",
      };
    })
    .sort((a, b) => a.consultorioId - b.consultorioId);

  // Filtrado
  const filteredData = contenido.filter(
    (item) =>
      item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.documento.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const Eliminar = async (id) => {
    try {
      const respuesta = await deleteData(`/api/Usuarios/DeleteUsuarios`, id);
      if (!respuesta) {
        throw new Error("Error al eliminar usuario");
      }

      // Actualizar UI solo cuando la API confirmó
      await fetchUsuarios();
    } catch (error) {
      alert("Ocurrió un error al eliminar el usuario");
    }
  };

  const informacion = (id) => {
    router.push(`/admin/usuarios/informacion/${id}`);
  };

  const informacionasesores = (id) => {
    router.push(`/admin/usuarios/informacion/editar-asesor/${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans p-4 sm:p-6 md:p-10 text-gray-800">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* --- Header de la Página --- */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#553285] flex items-center gap-3">
              <div className="p-2.5 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center shrink-0">
                <User className="w-6 h-6 sm:w-7 sm:h-7 text-[#FFCE21]" />
              </div>
              <span>Listado de usuario</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1 ml-0.5">
              Gestiona la información estudiantil.
            </p>
          </div>

          <button
            onClick={() => router.push("/admin/usuarios/registro-estudiante")}
            className="bg-[#553285] hover:bg-[#432669] active:scale-95 text-white px-5 py-2.5 rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 font-semibold text-sm self-start sm:self-auto"
          >
            <Plus className="w-5 h-5" />
            <span>Nuevo Usuario</span>
          </button>
        </div>

        {/* --- Barra de Búsqueda --- */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200/80">
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por nombre, documento..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#553285]/20 focus:border-[#553285] focus:bg-white transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* --- Contenedor de la Tabla --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200/80 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Nombre</th>
                  <th className="px-6 py-4">Documento</th>
                  <th className="px-6 py-4">Correo</th>
                  <th className="px-6 py-4">Consultorio</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredData.length > 0 ? (
                  filteredData.map((usuario) => (
                    <tr
                      key={usuario.id}
                      className="hover:bg-gray-50/80 transition-colors group"
                    >
                      {/* Columna Nombre + Avatar */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#553285] flex items-center justify-center text-[#FFCE21] font-bold text-sm shadow-sm shrink-0 uppercase">
                            {usuario.nombre.charAt(0)}
                          </div>
                          <span className="font-semibold text-gray-900">
                            {usuario.nombre}
                          </span>
                        </div>
                      </td>

                      {/* Columna Documento */}
                      <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                          <span className="font-mono text-xs text-gray-700">
                            {usuario.documento}
                          </span>
                        </div>
                      </td>

                      {/* Columna Correo */}
                      <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                          <span>{usuario.correo}</span>
                        </div>
                      </td>

                      {/* Columna Consultorio */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#FFCE21]/15 text-[#7a5c1a] border border-[#FFCE21]/40">
                          {usuario.consultorio}
                        </span>
                      </td>

                      {/* Botones de Acción */}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button
                            className="p-2 text-gray-400 hover:text-[#553285] hover:bg-[#553285]/10 rounded-lg transition-colors"
                            title="Información"
                            onClick={() =>
                              usuario.consultorioId !== 0
                                ? informacion(usuario.id)
                                : informacionasesores(usuario.id)
                            }
                          >
                            <FileUser className="w-4.5 h-4.5" />
                          </button>

                          <button
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                            onClick={() => Eliminar(usuario.id)}
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-gray-400 font-medium"
                    >
                      No se encontraron usuarios.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer de Paginación */}
          <div className="bg-gray-50/50 px-6 py-3.5 border-t border-gray-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
            <span className="text-gray-500 text-xs sm:text-sm">
              Mostrando{" "}
              <span className="font-semibold text-gray-800">
                {filteredData.length}
              </span>{" "}
              usuarios
            </span>

            <div className="flex gap-2">
              <button
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-40 disabled:hover:bg-white"
                disabled
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Anterior
              </button>
              <button className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
                Siguiente
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}