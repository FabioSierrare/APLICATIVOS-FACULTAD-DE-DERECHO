"use client";
import useFetchData from "@/components/FetchData";
import { useEffect, useState } from "react";
import { useUsuarioTurno } from "@/components/UsuarioData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Search, Trash, MailWarning } from "lucide-react";
import { useRouter } from "next/navigation";
import { deleteData } from "@/components/Delete";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import JSZip from "jszip"; // 🔹 usamos JSZip en vez de fs/archiver (porque estamos en cliente)

export default function Turnos() {
  const { data: Turno, fetchData } = useFetchData("/api/Turnos/GetTurnos");
  const { data: Usuarios } = useFetchData("/api/Usuarios/GetUsuarios");
  const { data: consultorioProfesores } = useFetchData(
    "/api/ConsultorioProfesores/GetConsultorioProfesores",
  );
  const { data: Rol } = useFetchData("/api/Rol/GetRol");
  const { data: Consultorios } = useFetchData(
    "/api/Consultorios/GetConsultorios",
  );
  const { data: ConfiguracionDias } = useFetchData(
    "/api/ConfiguracionDias/GetConfiguracionDias",
  );
  const { data: Calendario } = useFetchData("/api/Calendarios/GetCalendarios");
  const [Turnos, setmisTurnos] = useState([]);
  const [search, setSearch] = useState("");
  const { usuarioId, consultorioId, calendarioId } = useUsuarioTurno();
  const router = useRouter();
  useEffect(() => {
    if (!Turno || !Usuarios || !Consultorios) return; // 👈 dejamos lo mínimo necesario

    const TurnosX = Turno.filter((t) => t.calendarioId === calendarioId).map(
      (t) => {
        const usuario = Usuarios.find((u) => u.id === t.usuarioId);
        const Consultorio = Consultorios.find((c) => c.id === t.consultorioId);
        return {
          ...t,
          nombre: usuario?.nombre,
          documento: usuario?.documento,
          correo: usuario?.correo,
          consultorio: Consultorio?.nombre,
        };
      },
    );
    setmisTurnos(TurnosX);
  }, [Turno, Usuarios, Consultorios, calendarioId]); // 👈 dependencias mínimas

  const excel =
    Usuarios && Consultorios
      ? (Turnos || [])
          .map((t) => {
            const usuario = Usuarios.find((u) => u.id === t.usuarioId);
            const consultorio = Consultorios.find(
              (c) => c.id === t.consultorioId,
            );

            // Convertir la fecha a objeto Date
            const fechaObj = t?.fecha ? new Date(t.fecha) : null;

            // Formatear fecha: "Sep-07-2025"
            const fechaFormateada = fechaObj
              ? fechaObj
                  .toLocaleDateString("en-US", {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                  })
                  .replace(/ /g, "-") // cambia espacios por guiones
              : "Sin fecha";

            return {
              Estudiante: usuario?.nombre || "Sin nombre",
              Consultorio: consultorio?.id || "Sin consultorio",
              fechaTurno: fechaFormateada,
              jornada: t?.jornada || "Sin jornada",
              fechaOrden: fechaObj ? fechaObj.getTime() : 0, // 🔹 para ordenar
            };
          })
          .sort((a, b) => a.fechaOrden - b.fechaOrden) // 🔹 ordenar por fecha
          .map(({ fechaOrden, ...rest }) => rest) // eliminar el campo auxiliar
      : [];

  const filteredTurnos = Turnos.filter(
    (turno) =>
      turno?.nombre?.toLowerCase().includes(search.toLowerCase()) ||
      turno?.consultorio?.toLowerCase().includes(search.toLowerCase()) ||
      turno?.jornada?.toLowerCase().includes(search.toLowerCase()) ||
      turno?.documento?.toLowerCase().includes(search.toLowerCase()),
  );

  const Eliminar = async (turnoid) => {
    try {
      const respuesta = await deleteData(`/api/Turnos/DeleteTurnos`, turnoid);
      if (!respuesta) {
        throw new Error("Error al guardar el turno");
      }

      alert("Turno eliminado correctamente");
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const EliminarSin = async (turnoid) => {
    try {
      const respuesta = await deleteData(
        `/api/Turnos/DeleteTurnosSin`,
        turnoid,
      );
      if (!respuesta) {
        throw new Error("Error al guardar el turno");
      }

      alert("Turno eliminado correctamente");
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };
  if (
    !Calendario ||
    !ConfiguracionDias ||
    !consultorioProfesores ||
    !Usuarios
  ) {
    return <div>Cargando...</div>;
  }

  const asesores = consultorioProfesores
                  .filter((p) => p.calendarioId === calendarioId)
                  .map((p) => ({
                    ...p,
                    nombre:
                      Usuarios.find((u) => u.id === p.profesorId)?.nombre ||
                      "Nombre no disponible",
                  }));

                  console.log(asesores)

  return (
    <div className="m-6 md:m-10">
      {/* Barra de búsqueda */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold text-[#553285]">Gestión de Turnos</h1>
        <div className="flex w-full md:w-1/2 items-center gap-2">
          <Input
            type="text"
            placeholder="Buscar por estudiante y documento"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl border-gray-300 focus:ring-2 focus:ring-[#553285] transition"
          />
          <Button
            variant="secondary"
            className="bg-[#553285] text-white hover:bg-[#553285]/80 rounded-xl px-4"
          >
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <Button
            onClick={async () => {
              try {
                const diaConciliacion = Calendario.find(
                  (t) => t.id === calendarioId,
                ).diaConciliacion;
                const jornada = ConfiguracionDias.calendarioId === calendarioId;
                const data = excel; // aquí ya tienes tu array formateado
                const calendario = Calendario.find((t) => t.id === calendarioId);
                const asesores = consultorioProfesores
                  .filter((p) => p.calendarioId === calendarioId)
                  .map((p) => ({
                    ...p,
                    nombre:
                      Usuarios.find((u) => u.id === p.profesorId)?.nombre ||
                      "Nombre no disponible",
                  }));

                const response = await fetch("/api/exportar-turnos", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    diaConciliacion,
                    asesores,
                    data,
                    calendario,
                  }),
                });

                if (!response.ok) {
                  const errorText = await response.text();
                  throw new Error(errorText || "❌ Error al generar el archivo");
                }

                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `turnosMes_${diaConciliacion}.zip`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                setTimeout(() => window.URL.revokeObjectURL(url), 1000);
              } catch (error) {
                console.error("⚠️ Error al descargar:", error);
                alert("Ocurrió un error al descargar el archivo");
              }
            }}
            className="bg-green-600 text-white rounded-lg px-4 py-2 hover:bg-green-700"
          >
            Descargar Excels turnos
          </Button>
      </div>

      {/* Lista de turnos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredTurnos.length === 0 ? (
          <p className="text-center text-gray-500 col-span-full">
            No se encontraron turnos.
          </p>
        ) : (
          filteredTurnos.map((turno, index) => {
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
                key={index}
                className="bg-white rounded-2xl shadow-md p-6 w-full transition hover:shadow-xl border border-gray-200"
              >
                <div className="border-[#553285] pb-2 border-b-2 flex justify-between items-center">
                  <h2 className="sm:text-xl font-bold text-primary">
                    Información del Turno
                  </h2>
                  <div className="flex flex-col mdd:flex-row mdd:justify-between">
                    <Button
                      variant="secondary"
                      className="rounded-lg bg-red-500 text-white mb-2 mx-2 hover:bg-red-500/90 cursor-pointer sm:mb-2"
                      onClick={() => {
                        const confirmar = window.confirm(
                          "¿Estás seguro de eliminar este turno?",
                        );
                        if (!confirmar) return;

                        EliminarSin(turno.id);
                      }}
                    >
                      Eliminar <Trash />
                    </Button>
                    <Button
                      variant="secondary"
                      className="rounded-lg bg-red-500 text-white hover:bg-red-500/90 cursor-pointer"
                      onClick={() => {
                        const confirmar = window.confirm(
                          "¿Estás seguro de eliminar este turno?",
                        );
                        if (!confirmar) return;

                        Eliminar(turno.id);
                      }}
                    >
                      Eliminar y notificar <MailWarning />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3 mt-3">
                  <p className="text-gray-700">
                    <span className="font-semibold text-[#333333]">
                      Fecha Original:
                    </span>{" "}
                    {fechaColombia}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold text-[#333333]">
                      Jornada:
                    </span>
                    <span className="ml-2 px-3 py-1 bg-[#553285] text-white text-sm rounded-full inline-block">
                      {turno.jornada}
                    </span>
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold text-[#333333]">
                      Fecha detallada:
                    </span>
                    <span className="ml-2 text-[#553285] font-medium">
                      {fechaFormateada}
                    </span>
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold text-[#333333]">
                      Estudiante:
                    </span>
                    <span className="ml-2 px-3 py-1 bg-[#553285] text-white text-sm rounded-full inline-block">
                      {turno.nombre}
                    </span>
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold text-[#333333]">
                      Consultorio:
                    </span>
                    <span className="ml-2 text-[#553285] font-medium">
                      {turno.consultorio}
                    </span>
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
