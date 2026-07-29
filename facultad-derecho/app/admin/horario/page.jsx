"use client";
import { obtenerSemanas } from "@/components/obtenerTurnos";
import { useEffect, useState, useRef } from "react";
import useFetchData from "@/components/FetchData";
import { useUltimoCalendario } from "@/components/UltimoCalendario";
import React from "react";
import Holidays from "date-holidays";
import { Download } from "lucide-react";

export default function Prueba() {
  const calendario = useUltimoCalendario();
  const { data: turnos } = useFetchData("/api/Turnos/GetTurnos");
  const { data: usuarios } = useFetchData("/api/Usuarios/GetUsuarios");
  const { data: consultorioProfesores } = useFetchData(
    "/api/ConsultorioProfesores/GetConsultorioProfesores",
  );

  const [contador, setcontador] = useState(0);
  const verificacionFecha = new Date();
  const semanasInicializadas = useRef(false);

  const normalizarFecha = (fecha) => {
    const d = new Date(fecha);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  };

  const obtenerDomingo = (fechaInicio) => {
    const fecha = new Date(fechaInicio);

    const diaSemana = fecha.getDay(); // 0-6
    const diasParaDomingo = diaSemana === 0 ? 0 : 7 - diaSemana;

    fecha.setDate(fecha.getDate() + diasParaDomingo);
    fecha.setHours(0, 0, 0, 0);

    return fecha;
  };
  const semanas =
    calendario && obtenerSemanas(calendario, calendario.diaConciliacion);

  useEffect(() => {
    if (semanasInicializadas.current) return;

    if (!semanas || semanas.length === 0) return;

    semanasInicializadas.current = true;
    const fechaVerificacion = normalizarFecha(verificacionFecha);
    for (let i = 0; i < semanas.length; i++) {
      const fechaInicio = normalizarFecha(semanas[i][0].fecha);
      const fechaFin = normalizarFecha(obtenerDomingo(fechaInicio));
      if (fechaVerificacion >= fechaInicio && fechaVerificacion <= fechaFin) {
        setcontador(i);
      }
    }
  }, [semanas, verificacionFecha]);

  if (
    !calendario ||
    !turnos ||
    !usuarios ||
    !semanasInicializadas ||
    !consultorioProfesores
  )
    return <div>Cargando...</div>;

  const aumentar = () => {
    if (contador === semanas.length - 1) {
      return;
    }

    setcontador(contador + 1);
  };

  const decremento = () => {
    if (contador === 0) {
      return;
    }

    setcontador(contador - 1);
  };

  const descarga = async (contador) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/Horario/semana/pdf/${contador}`,
        {
          method: "GET",
          headers: {
            Accept: "application/pdf",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Error al generar el PDF");
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "Turnos_Semana.pdf"; // nombre final
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("No se pudo descargar el archivo");
    }
  };

  const asesoresCalendarioActual = consultorioProfesores
    .filter((cp) => cp.calendarioId === calendario.id)
    .map((cp) => {
      const nombre = usuarios.find((u) => cp.profesorId === u.id).nombre;

      return {
        Nombre: nombre,
        Jornada: cp.jornada,
        DiaSemana: cp.diaSemana,
      };
    });

  const hd = new Holidays("CO");

  const esFestivo = (fecha) => {
    return !!hd.isHoliday(new Date(fecha));
  };

  const año = new Date(calendario.fechaInicio).getFullYear();
  const semestre = calendario.semestre;

  const ordenJornada = {
    AM: 1,
    PM: 2,
  };

  const Turnosfilter = turnos
    .filter((t) => t.calendarioId === calendario.id)
    .map((t) => {
      const usuario = usuarios.find((u) => u.id === t.usuarioId);
      return {
        id: t.id,
        Nombre: usuario ? usuario.nombre : "No se encontró",
        consultorio: t.consultorioId,
        fecha: new Date(t.fecha),
        jornada: t.jornada,
      };
    })
    .sort((a, b) => {
      // 1. Comparar por fecha
      const diffFecha = a.fecha - b.fecha;
      if (diffFecha !== 0) return diffFecha;

      // 2. Si la fecha es la misma, comparar por jornada
      return ordenJornada[a.jornada] - ordenJornada[b.jornada];
    });

  const turnosPorSemana = semanas.map((semana) =>
    semana.map((dia) => {
      const turno = Turnosfilter.filter((t) => {
        const fechaTurno = t.fecha;
        const fechaDia = new Date(dia.fecha);

        fechaTurno.setHours(0, 0, 0, 0);
        fechaDia.setHours(0, 0, 0, 0);

        return fechaTurno.getTime() === fechaDia.getTime();
      }).sort((a, b) => ordenJornada[a.jornada] - ordenJornada[b.jornada]);

      const asesor = asesoresCalendarioActual.filter(
        (t) => dia.dia === t.DiaSemana,
      );

      return { ...dia, turno, asesor };
    }),
  );

  const primeraSemanaOrdenada = turnosPorSemana[contador];

  if (!primeraSemanaOrdenada) return <div>Cargando semana...</div>;
  // ... dentro de tu componente, antes del return:

  const obtenerFilasPorDia = (dia) => {
    const jornadas = ["AM", "PM"];
    let filasDia = [];

    jornadas.forEach((jornada) => {
      const estudiantesJornada = dia.turno.filter((t) => t.jornada === jornada);
      const asesoresJornada = dia.asesor.filter((a) => a.Jornada === jornada);

      // Determinamos cuántas filas necesitamos para esta jornada específica
      const maxFilas = Math.max(
        estudiantesJornada.length,
        asesoresJornada.length,
      );

      for (let i = 0; i < maxFilas; i++) {
        filasDia.push({
          jornada,
          estudiante: estudiantesJornada[i] || null,
          asesor: asesoresJornada[i] || null,
          // Usamos esto para el rowspan del diseño lateral del nombre del día
          esPrimeraFilaJornada: i === 0,
        });
      }
    });

    return filasDia;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans text-gray-800">
      {/* --- ENCABEZADO / HEADER --- */}
      <div className="mx-auto max-w-7xl border-2 border-black bg-white p-4 mb-6 relative">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo Placeholder */}
          <div className="w-24 h-24 flex-shrink-0 flex items-center justify-center">
            <img
              src="/img/Logo.png"
              alt="Logo Universidad"
              className="w-full h-auto object-contain"
            />
          </div>

          {/* Text Content */}
          <div className="text-center flex-grow space-y-1">
            <h1 className="text-lg md:text-xl font-bold text-[#003366] uppercase">
              Universidad Colegio Mayor de Cundinamarca
            </h1>
            <h2 className="text-sm font-bold uppercase">Facultad de Derecho</h2>
            <p className="text-xs md:text-sm font-semibold uppercase">
              Consultorio Jurídico y Centro de Conciliación
            </p>
            <p className="text-xs md:text-sm uppercase">
              Sede. Convenio UPK - Tintal "Universidad Pública en Kennedy"
            </p>
            <div className="mt-4 border-t border-gray-300 pt-2">
              <p className="text-sm font-bold uppercase">
                Listado de Asignación de Turnos para Estudiantes Periodo {año} -{" "}
                {semestre}
              </p>
              <p className="text-sm font-bold uppercase text-[#003366]">
                Semana No. {contador + 1}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* --- CONTROLES DE NAVEGACIÓN (NUEVO) --- */}
      <div className="mx-auto max-w-7xl mb-4 flex items-center justify-between">
        {/* Botón Izquierdo (Anterior) */}
        <button
          className="group flex items-center gap-2 px-5 py-2 bg-white border border-[#003366] text-[#003366] rounded hover:bg-[#003366] hover:text-white transition-all duration-300 shadow-sm font-semibold text-sm uppercase cursor-pointer"
          onClick={decremento}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
          Semana Anterior
        </button>

        {/* Indicador Central (Opcional, para contexto visual) */}
        <button
          className="group flex items-center gap-2 px-5 py-2 bg-white border border-[#003366] text-[#003366] rounded
             hover:bg-[#003366] hover:text-white transition-all duration-300 shadow-sm
             font-semibold text-sm uppercase cursor-pointer"
          onClick={() => descarga(contador)}
        >
          Descargar
          <Download
            size={18}
            className="transition-transform duration-300 group-hover:translate-y-0.5"
          />
        </button>

        {/* Botón Derecho (Siguiente) */}
        <button
          className="group flex items-center gap-2 px-5 py-2 bg-white border border-[#003366] text-[#003366] rounded hover:bg-[#003366] hover:text-white transition-all duration-300 shadow-sm font-semibold text-sm uppercase cursor-pointer"
          onClick={aumentar}
        >
          Siguiente Semana
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5 group-hover:translate-x-1 transition-transform"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 4.5l7.5 7.5-7.5 7.5"
            />
          </svg>
        </button>
      </div>

      {/* --- TABLA --- */}
      <div className="mx-auto max-w-7xl overflow-hidden shadow-lg border border-black bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] border-collapse text-sm">
            <thead>
              <tr className="bg-gray-200 text-black border-b-2 border-black">
                <th className="border-r border-black p-2 w-10">No</th>
                <th className="border-r border-black p-2 text-left">
                  Apellidos y Nombres Estudiante
                </th>
                <th className="border-r border-black p-2 w-12">CJ</th>
                <th className="border-r border-black p-2 w-16">Día</th>
                <th className="border-r border-black p-2 w-24">
                  Fecha de Turno
                </th>
                <th className="border-r border-black p-2 w-20">Jornada</th>
                <th className="border-r border-black p-2 w-32">
                  Firma Estudiante
                </th>
                <th className="border-r border-black p-2 text-left">
                  Nombre del Asesor
                </th>
                <th className="p-2 w-32">Firma Asesor</th>
              </tr>
            </thead>
            <tbody>
              {primeraSemanaOrdenada.map((dia, diaIndex) => {
                const filasEstructuradas = obtenerFilasPorDia(dia);
                const totalFilasDia = filasEstructuradas.length;

                // Si no hay nada en el día (ni turnos ni asesores)
                if (totalFilasDia === 0) {
                  return (
                    <React.Fragment key={dia.fecha}>
                      <tr>
                        <td className="border-r border-black p-2 text-center">
                          —
                        </td>
                        <td className="border-r border-black p-2 text-center italic text-gray-400">
                          {esFestivo(dia.fecha)
                            ? "Festivo"
                            : "Sin actividad asignada"}
                        </td>
                        <td className="border-r border-black p-2"></td>
                        <td className="border-r border-black p-2 text-center font-bold">
                          {dia.dia}
                        </td>
                        <td className="border-r border-black p-2 text-center">
                          {new Date(dia.fecha).toLocaleDateString("es-CO")}
                        </td>
                        <td colSpan={4} className="p-2"></td>
                      </tr>
                      <tr className="bg-black h-[2px]">
                        <td colSpan={9}></td>
                      </tr>
                    </React.Fragment>
                  );
                }

                return (
                  <React.Fragment key={dia.fecha}>
                    {filasEstructuradas.map((fila, filaIndex) => (
                      <tr key={`${dia.fecha}-${filaIndex}`}>
                        {/* No. (Contador global o relativo) */}
                        <td className="border-r border-black p-2 text-center">
                          {fila.estudiante
                            ? Turnosfilter.indexOf(fila.estudiante) + 1
                            : "—"}
                        </td>

                        {/* Estudiante */}
                        <td className="border-r border-black border p-2 uppercase">
                          {esFestivo(dia.fecha)
                            ? "Festivo"
                            : fila.estudiante?.Nombre || ""}
                        </td>

                        {/* CJ (Consultorio) */}
                        <td className="border-r border border-black p-2 text-center uppercase">
                          {fila.estudiante?.consultorio || ""}
                        </td>

                        {/* Columna Día (Solo aparece en la primera fila del día) */}
                        {filaIndex === 0 && (
                          <td
                            rowSpan={totalFilasDia}
                            className="border-r border-black p-0 align-middle bg-gray-50"
                          >
                            <div className="flex items-center justify-center h-full">
                              <span className="[writing-mode:vertical-rl] rotate-180 font-bold uppercase text-xs">
                                {dia.dia}
                              </span>
                            </div>
                          </td>
                        )}

                        {/* Fecha (Solo aparece en la primera fila del día o en todas, según prefieras) */}
                        <td className="border-r border-black border p-2 text-center">
                          {new Date(dia.fecha).toLocaleDateString("es-CO", {
                            day: "2-digit",
                            month: "short",
                          })}
                        </td>

                        {/* Jornada */}
                        <td className="border-r border border-black p-2 text-center uppercase font-semibold">
                          {fila.jornada}
                        </td>

                        {/* Firma Estudiante */}
                        <td className="border-r border border-black p-2"></td>

                        {/* Nombre del Asesor */}
                        <td className="border-r border-black p-2 border uppercase text-xs font-medium">
                          {fila.asesor?.Nombre || (
                            <span className="text-gray-300"></span>
                          )}
                        </td>

                        {/* Firma Asesor */}
                        <td className="p-2 border border-black"></td>
                      </tr>
                    ))}
                    {/* Separador entre días */}
                    <tr className="bg-black h-[2px]">
                      <td colSpan={9}></td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mx-auto max-w-7xl mt-4 text-xs text-gray-500 text-right">
        Generado automáticamente por el Sistema de Gestión Académica
      </div>
    </div>
  );
}
