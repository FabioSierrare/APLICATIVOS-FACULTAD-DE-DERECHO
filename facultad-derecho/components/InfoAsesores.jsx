"use client";
import useFetchData from "./FetchData";
import { PutData } from "./FetchPut";
import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Lock,
  FileText,
  Calendar,
  Clock,
  Edit2,
  Save,
  X,
  History,
  Building2,
  Eye,
  EyeOff,
  MapPin,
  ShieldCheck,
} from "lucide-react";

export default function InfoAsesor({ id }) {
  // --- 1. DATOS INVENTADOS (MOCK DATA) ---
  const { data: usuarios } = useFetchData(
    `/api/Usuarios/GetinfoAsesores/${id}`,
  );
  
  let moduserfirst = true

  const [user, setUserData] = useState({
    Nombre: "",
    Documento: "",
    Correo: "",
    contrasena: "",
    TipoDocumentoId: "",
    consultorio: ""
  });

  const [shifts] = useState([
    { id: 1, fecha: "2024-03-20T08:00:00", jornada: "Mañana (8:00 - 12:00)" },
    { id: 2, fecha: "2024-03-22T14:00:00", jornada: "Tarde (14:00 - 18:00)" },
    { id: 3, fecha: "2024-03-25T08:00:00", jornada: "Mañana (8:00 - 12:00)" },
  ]);

  const [pastShifts] = useState([
    { id: 10, fecha: "2024-02-10T08:00:00", jornada: "Mañana (8:00 - 12:00)" },
    { id: 11, fecha: "2024-02-15T14:00:00", jornada: "Tarde (14:00 - 18:00)" },
  ]);

  // --- ESTADOS UI ---
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // --- MANEJADORES UI ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...user, [name]: value });
  };
  
  const tipoDocumento = usuarios?.tiposDocumento;
  const turno = usuarios?.datosTurnosAsesores;

  useEffect(() => {
    if(!usuarios) return
    if (usuarios.usuarios && moduserfirst) {
        moduserfirst = false
      setUserData({
        Id: usuarios.usuarios.id ?? "",
        Nombre: usuarios.usuarios.nombre ?? "",
        Documento: usuarios.usuarios.documento ?? "",
        Correo: usuarios.usuarios.correo ?? "",
        contrasena: usuarios.usuarios.contrasena ?? "",
        TipoDocumentoId: usuarios.usuarios.tipoDocumentoId ?? "",
        RolId: usuarios.usuarios.rolId
      });
    }
  }, [usuarios, moduserfirst]);

  const SubmitUser = async (id) => {
    setIsEditing(false)
    try{
        const respuesta = await PutData(`/api/Usuarios/PutUsuarios/${id}`, user)

        if(!respuesta){
            throw alert("Error al enviar los datos")
        }

        alert("Actualizo la informacion correctamente")
    }catch(error){
        alert("No se pudo actualizar el usuario")
    }
  }

  if (!usuarios) return <p>Cargando...</p>;
  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans text-gray-800">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado General */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#553285]">
            Mi Perfil y Turnos
          </h1>
          <p className="text-gray-500 mt-1">
            Vista previa de plantilla con datos estáticos.
          </p>
        </div>

        {/* Grid Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ================= COLUMNA 1: FORMULARIO DE PERFIL ================= */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-700">
                  Información Personal
                </h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`p-2 rounded-full transition-colors ${
                    isEditing
                      ? "bg-red-50 text-red-500 hover:bg-red-100"
                      : "bg-[#553285] text-white hover:bg-[#4a2b75]"
                  }`}
                >
                  {isEditing ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Edit2 className="w-5 h-5" />
                  )}
                </button>
              </div>

              <div className="space-y-4">
                {/* Nombre */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">
                    Nombre Completo
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="Nombre"
                      disabled={!isEditing}
                      value={user.Nombre}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 bg-white border border-[#553285] rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#553285] disabled:bg-transparent disabled:border-transparent disabled:px-0 disabled:pl-10"
                    />
                  </div>
                </div>

                {/* Tipo de Documento */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Tipo de Documento
                  </label>
                  {isEditing ? (
                    <div className="relative flex items-center">
                      <ShieldCheck className="absolute left-3 w-5 h-5 text-[#553285]/40" />
                      <select
                        name="TipoDocumentoId"
                        value={user.TipoDocumentoId || ""}
                        disabled
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border-none border-[#553285] bg-white  appearance-none transition-all"
                      >
                        <option value="">Seleccionar tipo de documento</option>
                        {tipoDocumento.map((tipo) => (
                          <option key={tipo.id} value={tipo.id}>
                            {tipo.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="relative flex items-center">
                      <ShieldCheck className="absolute left-3 w-5 h-5 text-[#553285]/40" />
                      <input
                        type="text"
                        disabled
                        value={
                          tipoDocumento?.find(
                            (t) =>
                              Number(t.id) === Number(user.TipoDocumentoId ?? user.tipoDocumentoId),
                          )?.nombre || "Desconocido"
                        }
                        className="w-full pl-10 pr-4 py-2 rounded-lg border-none border-transparent text-gray-600"
                      />
                    </div>
                  )}
                </div>

                {/* Documento */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">
                    Documento
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="Documento"
                      disabled={!isEditing} // Usualmente el ID no se edita
                      value={user.Documento}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-10 py-2 bg-white border border-[#553285] rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#553285] disabled:bg-transparent disabled:border-transparent disabled:px-0 disabled:pl-10"
                    />
                  </div>
                </div>

                {/* Correo */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="Correo"
                      disabled={!isEditing}
                      value={user.Correo}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 bg-white border border-[#553285]  rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#553285] disabled:bg-transparent disabled:border-transparent disabled:px-0 disabled:pl-10"
                    />
                  </div>
                </div>

                {/* Contraseña */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">
                    Contraseña
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="contrasena"
                      disabled={!isEditing}
                      value={user.contrasena}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-10 py-2 bg-white border border-[#553285] rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#553285] disabled:bg-transparent disabled:border-transparent disabled:px-0 disabled:pl-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-gray-400 hover:text-[#553285]"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Botón Guardar (Solo visible al editar) */}
                {isEditing && (
                  <button
                    onClick={() => { SubmitUser(user.Id)}}
                    className="w-full flex items-center justify-center gap-2 bg-[#553285] text-white py-2 rounded-lg hover:bg-[#44286a] transition-all mt-4"
                  >
                    <Save className="w-4 h-4" />
                    Guardar Cambios
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ================= COLUMNA 2 Y 3: TURNOS ================= */}
          <div className="lg:col-span-2 space-y-8">
            {/* SECCIÓN: PRÓXIMOS TURNOS */}
            <div>
              <h3 className="text-xl font-bold text-[#553285] mb-4 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-[#FFCE21]" />
                Turnos Programados
              </h3>

              <div className="grid grid-cols-1 gap-4">
                {/* Simulación de TurnosList (Card Loop) */}
                {turno.map((turno, index) => (
                  <div
                    key={index}
                    className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-[#FFCE21] flex flex-col md:flex-row justify-between items-center group hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4 mb-3 md:mb-0">
                      <div className="bg-yellow-50 p-3 rounded-full text-[#FFCE21]">
                        <Clock className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-lg">
                          {turno.diaSemana}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          {turno.calendario}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium border border-gray-200">
                        {turno.jornada}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
