"use client";
import useFetchData from "@/components/FetchData";
import { useState, useEffect } from "react";
import { useUsuarioTurno } from "@/components/UsuarioData";
export const runtime = "edge"

export default function TurnoCard() {
  const { data: Turnos } = useFetchData("/api/Turnos/GetTurnos");
  const [misTurnos, setmisTurnos] = useState([]);
  const { usuarioId, consultorioId, calendarioId } = useUsuarioTurno();

  useEffect(() => {
    if (!Turnos || !usuarioId || !calendarioId) return;

    const misTurno = Turnos.filter((t) => t.usuarioId === usuarioId && t.calendarioId === calendarioId);
    setmisTurnos(misTurno);

    console.log(misTurno);
  }, [Turnos, usuarioId, calendarioId]);

  const opciones = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  };

  return (
    <div>
      <h1 className="text-active-text text-3xl mt-4 mb-6 font-semibold mx-5">
        SOLICITUD DE TURNOS CONSULTORIO
      </h1>

      <div className="grid grid-cols-2 m-10 gap-10">
        {misTurnos.length === 0 && (
          <p className="text-center text-gray-500">
            No tienes turnos asignados.
          </p>
        )}

        {misTurnos.map((turno, index) => {
          const fechaObj = new Date(turno.fecha);

          // Solo fecha en formato colombiano
          const fechaColombia = fechaObj.toLocaleDateString("es-CO", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });

          // Fecha con nombre del día y mes
          const fechaFormateada = fechaObj.toLocaleDateString("es-CO", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          });

          return (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-md p-6 w-full max-w-md mx-auto my-4 transition hover:shadow-xl border border-gray-200"
            >
              <h2 className="text-xl font-bold mb-4 text-[#553285] border-b-2 border-[#553285] pb-2">
                Información del Turno
              </h2>
              <div className="space-y-3">
                <p className="text-gray-700">
                  <span className="font-semibold text-[#333333]">
                    Fecha Original:
                  </span>{" "}
                  {fechaColombia}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold text-[#333333]">Jornada:</span>
                  <span className="ml-2 px-3 py-1 bg-[#553285] text-white text-sm rounded-full inline-block">
                    {turno.jornada}
                  </span>
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold text-[#333333]">
                    Fecha Formateada:
                  </span>
                  <span className="ml-2 text-[#553285] font-medium">
                    {fechaFormateada}
                  </span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
