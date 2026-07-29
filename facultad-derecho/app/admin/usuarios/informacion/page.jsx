"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  User,
  Mail,
  FileText,
  MapPin,
  FileUser,
} from "lucide-react";
import useFetchData from "@/components/FetchData";
import CalendarSkeleton from "@/components/cargando";
import { deleteData } from "@/components/Delete";
import { useRouter } from "next/navigation";

export default function GestionUsuarios() {
  // Datos simulados de Usuarios
  const { data: initialData, fetchData: fetchUsuarios } = useFetchData(
    "/api/Usuarios/GetUsuarios",
  );
  const { data: consultorio, fetchData: fetchConsultorio } = useFetchData(
    "/api/UsuarioConsultorios/GetUsuarioConsultorio",
  );

  const [usuarios, setUsuarios] = useState([]);

  //Router
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
      item.documento.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const Eliminar = async (id) => {
    try {
      const respuesta = await deleteData(`/api/Usuarios/DeleteUsuarios`, id);
      if (!respuesta) {
        throw new Error("Error al eliminar usuario");
      }

      // 4. Actualizar UI solo cuando la API confirmó
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
    <div className="min-h-screen bg-gray-50 font-sans p-6 md:p-10 text-gray-800">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* --- Header de la Página --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#553285] flex items-center gap-3">
              {/* Icono grande con el color secundario */}
              <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100">
                <User className="w-8 h-8 text-[#FFCE21]" />
              </div>
              Listado de usuario
            </h1>
            <p className="text-gray-500 mt-2 ml-1">
              Gestiona la información estudiantil.
            </p>
          </div>

          <button
            onClick={() => router.push("/admin/usuarios/registro-estudiante")}
            className="bg-[#553285] hover:bg-[#432669] text-white px-5 py-2.5 rounded-lg shadow-md transition-all flex items-center gap-2 font-medium"
          >
            <Plus className="w-5 h-5" />
            Nuevo Usuario
          </button>
        </div>

        {/* --- Barra de Búsqueda --- */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre, documento..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#553285]/20 focus:border-[#553285] transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* --- Contenedor de la Tabla (Estilo "White Card") --- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              {/* Encabezado CLARO (Gris claro en vez de morado sólido) */}
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Documento
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Correo
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Consultorio
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredData.length > 0 ? (
                  filteredData.map((usuario) => (
                    <tr
                      key={usuario.id}
                      className="hover:bg-gray-50/80 transition-colors group"
                    >
                      {/* Columna Nombre + Avatar */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {/* Avatar Circular: Fondo Morado, Texto Amarillo */}
                          <div className="w-10 h-10 rounded-full bg-[#553285] flex items-center justify-center text-[#FFCE21] font-bold text-sm shadow-sm">
                            {usuario.nombre.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {usuario.nombre}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Columna Documento */}
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          {usuario.documento}
                        </div>
                      </td>

                      {/* Columna Correo */}
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {usuario.correo}
                        </div>
                      </td>

                      {/* Columna Consultorio (Badge sutil) */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#FFCE21]/10 text-[#7a5c1a] border border-[#FFCE21]/40">
                          {usuario.consultorio}
                        </span>
                      </td>

                      {/* Botones de Acción */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          {/* Editar (Morado suave) */}
                          <button
                            className="p-2 text-gray-500 hover:text-[#553285] hover:bg-[#553285]/10 rounded-lg transition-colors"
                            title="Información"
                            onClick={() => usuario.consultorioId !== 0 ? informacion(usuario.id) : informacionasesores(usuario.id)}
                          >
                            <FileUser className="w-4 h-4" />
                          </button>

                          {/* Eliminar (Rojo suave) */}
                          <button
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                            onClick={() => Eliminar(usuario.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No se encontraron usuarios.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer de Paginación Simple */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Mostrando{" "}
              <span className="font-medium text-gray-700">
                {filteredData.length}
              </span>{" "}
              usuarios
            </span>
            <div className="flex gap-2">
              <button
                className="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50 shadow-sm disabled:opacity-50"
                disabled
              >
                Anterior
              </button>
              <button className="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50 shadow-sm">
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
