"use client";

import useFetchData from "@/components/FetchData";
import { useEffect, useState, useMemo } from "react";
import { useUsuarioTurno } from "@/components/UsuarioData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Trash2, 
  MailWarning, 
  Download, 
  Calendar, 
  Clock, 
  User, 
  Building2, 
  Loader2,
  AlertTriangle,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { deleteData } from "@/components/Delete";

export default function Turnos() {
  const { data: Turno, fetchData } = useFetchData("/api/Turnos/GetTurnos");
  const { data: Usuarios } = useFetchData("/api/Usuarios/GetUsuarios");
  const { data: consultorioProfesores } = useFetchData(
    "/api/ConsultorioProfesores/GetConsultorioProfesores"
  );
  const { data: Rol } = useFetchData("/api/Rol/GetRol");
  const { data: Consultorios } = useFetchData(
    "/api/Consultorios/GetConsultorios"
  );
  const { data: ConfiguracionDias } = useFetchData(
    "/api/ConfiguracionDias/GetConfiguracionDias"
  );
  const { data: Calendario } = useFetchData("/api/Calendarios/GetCalendarios");

  const [turnosFormatted, setTurnosFormatted] = useState([]);
  const [search, setSearch] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  // Estados para los modales personalizados
  const [modalConfirmacion, setModalConfirmacion] = useState({
    isOpen: false,
    turnoId: null,
    notificar: false,
    loading: false,
  });

  const [modalNotificacion, setModalNotificacion] = useState({
    isOpen: false,
    tipo: "success", // 'success' | 'error'
    titulo: "",
    mensaje: "",
  });

  const { usuarioId, consultorioId, calendarioId } = useUsuarioTurno();
  const router = useRouter();

  // Mapeo y enriquecimiento de los turnos base
  useEffect(() => {
    if (!Turno || !Usuarios || !Consultorios) return;

    const TurnosX = Turno.filter((t) => t.calendarioId === calendarioId).map((t) => {
      const usuario = Usuarios.find((u) => u.id === t.usuarioId);
      const Consultorio = Consultorios.find((c) => c.id === t.consultorioId);
      return {
        ...t,
        nombre: usuario?.nombre || "Sin nombre",
        documento: usuario?.documento || "Sin documento",
        correo: usuario?.correo || "",
        consultorio: Consultorio?.nombre || "Sin consultorio",
      };
    });
    setTurnosFormatted(TurnosX);
  }, [Turno, Usuarios, Consultorios, calendarioId]);

  // Transformación optimizada para la exportación a Excel
  const excelData = useMemo(() => {
    if (!Usuarios || !Consultorios || !turnosFormatted.length) return [];

    return turnosFormatted
      .map((t) => {
        const usuario = Usuarios.find((u) => u.id === t.usuarioId);
        const consultorio = Consultorios.find((c) => c.id === t.consultorioId);
        const fechaObj = t?.fecha ? new Date(t.fecha) : null;

        const fechaFormateada = fechaObj
          ? fechaObj
              .toLocaleDateString("en-US", {
                month: "short",
                day: "2-digit",
                year: "numeric",
              })
              .replace(/ /g, "-")
          : "Sin fecha";

        return {
          Estudiante: usuario?.nombre || "Sin nombre",
          Consultorio: consultorio?.id || "Sin consultorio",
          fechaTurno: fechaFormateada,
          jornada: t?.jornada || "Sin jornada",
          fechaOrden: fechaObj ? fechaObj.getTime() : 0,
        };
      })
      .sort((a, b) => a.fechaOrden - b.fechaOrden)
      .map(({ fechaOrden, ...rest }) => rest);
  }, [Usuarios, Consultorios, turnosFormatted]);

  // Filtrado reactivo en barra de búsqueda
  const filteredTurnos = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return turnosFormatted;

    return turnosFormatted.filter(
      (t) =>
        t?.nombre?.toLowerCase().includes(q) ||
        t?.consultorio?.toLowerCase().includes(q) ||
        t?.jornada?.toLowerCase().includes(q) ||
        t?.documento?.toLowerCase().includes(q)
    );
  }, [turnosFormatted, search]);

  // Mapeo de asesores
  const asesores = useMemo(() => {
    if (!consultorioProfesores || !Usuarios) return [];
    return consultorioProfesores
      .filter((p) => p.calendarioId === calendarioId)
      .map((p) => ({
        ...p,
        nombre:
          Usuarios.find((u) => u.id === p.profesorId)?.nombre ||
          "Nombre no disponible",
      }));
  }, [consultorioProfesores, Usuarios, calendarioId]);

  // Abrir modal de confirmación
  const solicitarEliminacion = (turnoId, notificar) => {
    setModalConfirmacion({
      isOpen: true,
      turnoId,
      notificar,
      loading: false,
    });
  };

  // Procesar eliminación tras confirmar en el modal
  const ejecutarEliminacion = async () => {
    const { turnoId, notificar } = modalConfirmacion;
    setModalConfirmacion((prev) => ({ ...prev, loading: true }));

    try {
      const endpoint = notificar
        ? `/api/Turnos/DeleteTurnos`
        : `/api/Turnos/DeleteTurnosSin`;

      const respuesta = await deleteData(endpoint, turnoId);
      if (!respuesta) throw new Error("Error al procesar la eliminación");

      setModalConfirmacion({ isOpen: false, turnoId: null, notificar: false, loading: false });
      
      setModalNotificacion({
        isOpen: true,
        tipo: "success",
        titulo: "¡Turno eliminado!",
        mensaje: notificar
          ? "El turno ha sido eliminado y se ha enviado la notificación por correo al estudiante."
          : "El turno ha sido eliminado exitosamente del sistema.",
      });

      fetchData();
    } catch (error) {
      console.error(error);
      setModalConfirmacion({ isOpen: false, turnoId: null, notificar: false, loading: false });

      setModalNotificacion({
        isOpen: true,
        tipo: "error",
        titulo: "Error al eliminar",
        mensaje: "Ocurrió un inconveniente al intentar eliminar el turno. Por favor, reintenta más tarde.",
      });
    }
  };

  const handleExportarExcel = async () => {
    try {
      setIsExporting(true);
      const diaConciliacion = Calendario.find((t) => t.id === calendarioId)?.diaConciliacion;
      const calendario = Calendario.find((t) => t.id === calendarioId);

      const response = await fetch("/api/exportar-turnos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          diaConciliacion,
          asesores,
          data: excelData,
          calendario,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Error al generar el archivo");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `turnosMes_${diaConciliacion || "export"}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error("Error al descargar:", error);
      setModalNotificacion({
        isOpen: true,
        tipo: "error",
        titulo: "Error de descarga",
        mensaje: "Ocurrió un problema al intentar generar o descargar el archivo de exportación.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (!Calendario || !ConfiguracionDias || !consultorioProfesores || !Usuarios) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-gray-500">
        <Loader2 className="h-8 w-8 animate-spin text-[#553285]" />
        <p className="text-sm font-medium">Cargando información de turnos...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 relative">
      {/* Header & Controles Principal */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#553285]">
            Gestión de Turnos
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Administra los horarios asignados e imprime reportes.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Campo de Búsqueda */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar por estudiante o documento..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 rounded-xl border-gray-200 focus:border-[#553285] focus:ring-[#553285] text-sm"
            />
          </div>

          {/* Botón de Exportación */}
          <Button
            onClick={handleExportarExcel}
            disabled={isExporting}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl px-4 py-2 flex items-center justify-center gap-2 transition"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            <span>Exportar Turnos</span>
          </Button>
        </div>
      </div>

      {/* Grid de Turnos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {filteredTurnos.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
            <Search className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-base font-medium text-gray-700">No se encontraron turnos</p>
            <p className="text-sm text-gray-400 mt-1">
              Prueba cambiando el término de búsqueda.
            </p>
          </div>
        ) : (
          filteredTurnos.map((turno) => {
            const fechaObj = new Date(turno.fecha);
            const fechaColombia = fechaObj.toLocaleDateString("es-CO", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            });

            const fechaFormateada = fechaObj.toLocaleDateString("es-CO", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            });

            return (
              <div
                key={turno.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col justify-between gap-6"
              >
                {/* Cabecera de la Tarjeta */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-[#553285]" />
                    <h2 className="font-semibold text-gray-800 text-base">
                      Información del Turno
                    </h2>
                  </div>
                  <span className="px-3 py-1 bg-[#553285]/10 text-[#553285] font-medium text-xs rounded-full capitalize">
                    {turno.jornada}
                  </span>
                </div>

                {/* Detalles de la Información */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-start gap-2.5">
                    <User className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Estudiante</p>
                      <p className="text-gray-800 font-medium mt-0.5">{turno.nombre}</p>
                      {turno.documento && (
                        <p className="text-xs text-gray-400">Doc: {turno.documento}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Building2 className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Consultorio</p>
                      <p className="text-gray-800 font-medium mt-0.5">{turno.consultorio}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Calendar className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Fecha Programada</p>
                      <p className="text-gray-800 font-medium mt-0.5">{fechaColombia}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Clock className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Día Completo</p>
                      <p className="text-gray-800 font-medium capitalize mt-0.5">
                        {fechaFormateada}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Botones de Acción */}
                <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 text-xs flex items-center justify-center gap-1.5"
                    onClick={() => solicitarEliminacion(turno.id, false)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Eliminar</span>
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    className="rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs flex items-center justify-center gap-1.5"
                    onClick={() => solicitarEliminacion(turno.id, true)}
                  >
                    <MailWarning className="h-3.5 w-3.5" />
                    <span>Eliminar y notificar</span>
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Personalizado: Confirmación de Eliminación */}
      {modalConfirmacion.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-50 rounded-xl text-red-600 shrink-0">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  ¿Confirmar eliminación?
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Esta acción no se puede deshacer.
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-600">
              {modalConfirmacion.notificar
                ? "Se procederá a borrar el turno del registro y se le enviará un correo electrónico de notificación al estudiante."
                : "Se procederá a borrar el turno del registro de forma directa sin enviar notificación."}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                className="rounded-xl text-sm"
                disabled={modalConfirmacion.loading}
                onClick={() =>
                  setModalConfirmacion({ isOpen: false, turnoId: null, notificar: false, loading: false })
                }
              >
                Cancelar
              </Button>

              <Button
                variant="destructive"
                className="rounded-xl bg-red-600 hover:bg-red-700 text-sm flex items-center gap-2"
                disabled={modalConfirmacion.loading}
                onClick={ejecutarEliminacion}
              >
                {modalConfirmacion.loading && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>Eliminar registro</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Personalizado: Notificación / Estado */}
      {modalNotificacion.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 space-y-4 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-50">
              {modalNotificacion.tipo === "success" ? (
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              ) : (
                <XCircle className="h-8 w-8 text-red-600" />
              )}
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-gray-900">
                {modalNotificacion.titulo}
              </h3>
              <p className="text-sm text-gray-500">
                {modalNotificacion.mensaje}
              </p>
            </div>

            <div className="pt-2">
              <Button
                className="w-full rounded-xl bg-[#553285] hover:bg-[#43276a] text-white text-sm"
                onClick={() =>
                  setModalNotificacion({ isOpen: false, tipo: "success", titulo: "", mensaje: "" })
                }
              >
                Entendido
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}