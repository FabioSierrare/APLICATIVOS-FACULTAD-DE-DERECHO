"use client";

import CalendarSkeleton from "./cargando";
import React, { useEffect, useState } from "react";
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
  ShieldCheck,
  Building2,
  Eye,
  EyeOff,
} from "lucide-react";
import useFetchData from "./FetchData";
import UserProfileForm from "./UserProfileForm";
import TurnosList from "./TurnosList";
import EditTurnoModal from "./EditTurnoModal";
import { PutData } from "./FetchPut";

export default function UserProfilePage({ id }) {
  // --- ESTADOS ---
  const { data: infouser, fetchData: fetchInfo } = useFetchData(`/api/Usuarios/GetInfoUser/${id}`);
  // 1. Estado para controlar si se está editando el perfil
  const [isEditing, setIsEditing] = useState(false);
  // guardamos sólo el ID del calendario actual
  const [IdCalendarioActual, setCalendarioActual] = useState(null);

  // Estado para mostrar/ocultar contraseña
  const [showPassword, setShowPassword] = useState(false);

  // Estado para turnos (inicializado desde infouser.turno)
  const [shifts, setShifts] = useState([]);
  // Estado para editar un turno
  const [editingTurno, setEditingTurno] = useState(null);
  const [editDate, setEditDate] = useState(null);
  const [editJornada, setEditJornada] = useState("");

  // 2. Datos del Usuario (Simulados)
  const [userData, setUserData] = useState({});

  // --- TODOS LOS EFFECTS AL INICIO (antes de render logic) ---
  useEffect(() => {
    if (infouser) {
      // Inicializar userData con los datos más recientes de infouser
      const newUserData = {
        ...infouser.usuario,
        consultorioId:
          infouser.usuario?.consultorioId ??
          infouser?.consultorioId ??
          "",
      };
      setUserData(newUserData);
      setShifts(Array.isArray(infouser.turno) ? infouser.turno : []);
    }
  }, [infouser]);

  // Si no hay calendario seleccionado, inicializarlo desde los turnos (primer calendario disponible)
  useEffect(() => {
    if (!IdCalendarioActual && shifts && shifts.length > 0) {
      const firstCalId = shifts.find(
        (s) => s.calendarioId != null
      )?.calendarioId;
      if (firstCalId != null) setCalendarioActual(Number(firstCalId));
    }
  }, [shifts, IdCalendarioActual]);

  if (!infouser) return <CalendarSkeleton />;

  // 3. Datos de Turnos (desde estado `shifts`)
  const now = new Date();
  // Asegurarnos de comparar números (o strings coherentes)
  const currentShifts = IdCalendarioActual
    ? shifts.filter(
        (t) => Number(t.calendarioId) === Number(IdCalendarioActual)
      )
    : shifts;
  const pastShifts = shifts;

  // --- MANEJADORES ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const toggleEdit = async () => {
    if (isEditing) {
      const Actualizar = {
        Usuarios: {
          Id: parseInt(userData.id),
          Nombre: userData.nombre,
          Documento: userData.documento,
          TipoDocumentoId: parseInt(userData.tipoDocumentoId),
          Correo: userData.correo,
          Contrasena: userData.contrasena,
          RolId: parseInt(userData.rolId),
        },
        Consultorio: {
          Id: 0,
          UsuarioId: parseInt(userData.id),
          ConsultorioId: parseInt(userData.consultorioId),
        },
      };

      try {
        // Optimistic update: mostrar cambios inmediatamente en el front
        setUserData((prev) => ({
          ...prev,
          consultorioId: userData.consultorioId,
        }));

        const respuesta = await PutData(
          `/api/Usuarios/PutUsuarioEstudiante/${userData.id}`,
          Actualizar
        );
        if (!respuesta) {
          throw new Error("Error al actualizar usuario");
        }

        // Refrescar datos desde el servidor para sincronizar
        await fetchInfo();
        setIsEditing(false);
        alert("Usuario actualizado con éxito");
        
      } catch (error) {
        alert("Ocurrió un error al actualizar el usuario");
        // Si falla, recargar datos para revertir los cambios locales
        await fetchInfo();
      }
      // Si estamos guardando (isEditing es true), aquí iría la lógica de guardar en BD
    } else {
      setIsEditing(true);
    }
  };

  // Inicia la edición de un turno: abre modal y pone valores iniciales
  const startEditTurno = (turno) => {
    setEditingTurno(turno);
    setEditDate(turno.fecha ? new Date(turno.fecha) : null);
    setEditJornada(turno.jornada || "");
  };

  const cancelEditTurno = () => {
    setEditingTurno(null);
    setEditDate(null);
    setEditJornada("");
  };

  // Guarda los cambios del turno en el servidor y localmente
  const saveEditTurno = async (updatedTurno) => {
    // Si la llamada viene con el turno ya actualizado desde el modal
    if (updatedTurno) {
      try {
        // Validar que tenemos los datos mínimos
        if (!updatedTurno.id) {
          alert("Error: No se puede actualizar un turno sin ID");
          return;
        }

        // Preparar payload para la API
        const payload = {
          Id: updatedTurno.id,
          UsuarioId: updatedTurno.usuarioId,
          ConsultorioId: updatedTurno.consultorioId,
          CalendarioId: updatedTurno.calendarioId,
          Fecha: new Date(updatedTurno.fecha), // ISO string
          Jornada: updatedTurno.jornada,
        };

        // Hacer petición PUT a la API
        const respuesta = await PutData(
          `/api/Turnos/PutTurnos/${updatedTurno.id}`,
          payload
        );

        if (!respuesta) {
          throw new Error("Error al actualizar turno");
        }

        await fetchInfo(); // refrescar datos del usuario
        // Actualizar el estado local
        setShifts((prev) =>
          prev.map((t) => (t.id === updatedTurno.id ? updatedTurno : t))
        );
        
        cancelEditTurno();
        alert("Turno actualizado con éxito");
      } catch (error) {
        console.error("Error actualizando turno:", error);
        alert(`Error: ${error?.message || "No se pudo actualizar el turno"}`);
      }
      return;
    }

    // Si se usa el flujo viejo con campos editDate / editJornada (fallback)
    if (!editingTurno) return;
    setShifts((prev) =>
      prev.map((t) =>
        t.id === editingTurno.id
          ? {
              ...t,
              fecha: editDate ? editDate.toISOString() : t.fecha,
              jornada: editJornada,
            }
          : t
      )
    );
    cancelEditTurno();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans text-gray-800">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado General */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#553285]">
            Mi Perfil y Turnos
          </h1>
          <p className="text-gray-500">
            Gestiona tu información personal y revisa tu programación.
          </p>
        </div>

        {/* Grid Principal: Izquierda (Perfil) - Derecha (Turnos) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ================= SECCIÓN 1: PERFIL DE USUARIO (COMPONENTE) ================= */}
          <div className="lg:col-span-1">
            <UserProfileForm
              isEditing={isEditing}
              userData={userData}
              handleInputChange={handleInputChange}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              infouser={infouser}
              toggleEdit={toggleEdit}
            />
          </div>

          {/* ================= COLUMNA DERECHA: TURNOS ================= */}
          <div className="lg:col-span-2 space-y-8">
            {/* SECCIÓN 2: TURNOS ACTUALES */}
            <div>
              <h3 className="text-xl font-bold text-[#553285] mb-4 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-[#FFCE21]" />
                Turnos Programados (Actuales)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <TurnosList
                  turnos={currentShifts}
                  onEditTurno={startEditTurno}
                />
              </div>
            </div>

            {/* Modal / Panel de edición de turno */}
            {editingTurno && (
              <EditTurnoModal
                open={true}
                turno={editingTurno}
                onClose={cancelEditTurno}
                onSave={saveEditTurno}
                calendarioActual={IdCalendarioActual}
                setCalendarioActual={setCalendarioActual}
              />
            )}

            {/* SECCIÓN 3: HISTORIAL DE TURNOS */}
            <div>
              <h3 className="text-xl font-bold text-gray-400 mb-4 flex items-center gap-2">
                <History className="w-6 h-6" />
                Historial de Turnos
              </h3>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                        Jornada
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pastShifts.map((turno) => (
                      <tr key={turno.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                          {new Date(turno.fecha).toLocaleDateString("es-ES", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {turno.jornada}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
