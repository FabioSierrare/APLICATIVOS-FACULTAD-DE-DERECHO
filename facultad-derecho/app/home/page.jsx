"use client";
import { useCalendar } from "@/components/useCalendar";
import { CalendarHeader } from "@/components/CalendarHeader";
import { DayCell } from "@/components/DayCell";
import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import useFetchData from "@/components/FetchData";
import { postData } from "@/components/FetchPost";
import { useUsuarioTurno } from "@/components/UsuarioData";
import { useRouter } from "next/navigation";
export const runtime = "edge";

export default function Home() {
  const [jornada, setJornada] = useState("");
  const fechaActual = new Date();
  const { mes, año, diasDelMes, selectedDay, cambiarMes, setSelectedDay } =
    useCalendar(fechaActual.getMonth() + 1, fechaActual.getFullYear(), jornada);

  const { usuarioId, consultorioId, calendarioId } = useUsuarioTurno();
  const [Turnos, setTurnos] = useState({});
  const router = useRouter();
  // Después de hacer login y obtener el token

  //Aqui se esta obteniendo los datos para el uso de calendario
  const { data: calendario, loading } = useFetchData(
    "/api/Calendarios/GetCalendarios"
  );
  const [Calendariox, setCalendario] = useState({});

  useEffect(() => {
    if (!calendario || !Array.isArray(calendario) || calendario.length === 0)
      return;

    const ultimoCalendario = calendario[calendario.length - 1];
    setCalendario(ultimoCalendario);
  }, [calendario]); // solo depende de calendario

  const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

  // valor por defecto

  //Aqui se estan guardando los datos seleccionables
  useEffect(() => {
    if (!selectedDay) return; // si no hay día seleccionado, no hacemos nada

    const turnoSeleccionado = {
      fecha: selectedDay,
      jornada: jornada,
    };

    console.log("Turno seleccionado:", turnoSeleccionado);

    // Aquí podrías hacer un fetch/post a tu API:
    // fetch("/api/turnos", { method: "POST", body: JSON.stringify(turnoSeleccionado) })
  }, [selectedDay, jornada]);

  //Aqui se esta obteniendo el consultorio al cual pertenece el estudiante
  const { data: consultorio } = useFetchData(
    "/api/UsuarioConsultorios/GetUsuarioConsultorio"
  );

  useEffect(() => {
    if (!consultorio || !Array.isArray(consultorio) || consultorio.length === 0)
      return;

    console.log("Consultorio", consultorio);
  }, [consultorio]);

  //Aqui se esta preparando los datos a guardar de Turnos
  useEffect(() => {
    if (!selectedDay) return;

    setTurnos({
      UsuarioId: usuarioId, // 👈 Ajusta al nombre real que tengas en tu modelo
      ConsultorioId: consultorioId, // 👈 Ajusta al nombre real
      CalendarioId: calendarioId, // 👈 Ajusta al nombre real
      Fecha: new Date(selectedDay),
      Jornada: jornada,
    });
  }, [calendarioId, usuarioId, selectedDay, jornada, consultorioId]);

  useEffect(() => {
    if (!Turnos) return;

    console.log("Turnos actualizado:", Turnos);

    if (
      Turnos.UsuarioId &&
      Turnos.CalendarioId &&
      Turnos.Fecha &&
      Turnos.Jornada
    ) {
      console.log("✅ Turnos está lleno", Turnos);
    } else {
      console.log("⚠️ Turnos incompleto");
    }
  }, [Turnos]);

  const handleSaveTurno = async () => {
    // Validación
    if (
      !Turnos.UsuarioId ||
      !Turnos.ConsultorioId ||
      !Turnos.CalendarioId ||
      !Turnos.Fecha ||
      !Turnos.Jornada
    ) {
      alert("⚠️ Todos los campos son obligatorios");
      return;
    }

    try {
      const response = await postData("/api/Turnos/PostTurnos", Turnos);

      if (!response) {
        throw new Error("Error al guardar el turno");
      }

      alert("Turno guardado con éxito");
      router.push("/home/turnos");
    } catch (error) {
      console.error("❌ Error:", error);
      alert("Ocurrió un error al guardar el turno");
    }
  };

  //Importa datos calendario
  return (
    <div className="w-full px-4">
      <h1 className="text-active-text text-3xl mt-4 mb-6 font-semibold">
        SOLICITUD DE TURNOS CONSULTORIO
      </h1>

      <div className="flex flex-col lg:flex-row justify-between w-full py-4 gap-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden w-full max-w-2xl">
          <CalendarHeader mes={mes} año={año} cambiarMes={cambiarMes} />

          <div className="grid grid-cols-5 gap-1 px-4 pt-2 pb-1 bg-primary/10">
            {diasSemana.map((dia) => (
              <div
                key={dia}
                className="text-center text-primary font-medium text-sm py-2"
              >
                {dia}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-5 gap-1 p-4">
            <DayCell
              diasDelMes={diasDelMes}
              selectedDay={selectedDay}
              setSelectedDay={setSelectedDay}
            />
          </div>
        </div>

        {/**Indicaciones de colores */}

        {/* Sección de turnos */}
        <div className="flex flex-col justify-between items-start gap-4 w-full max-w-xs">
          <div className="w-full">
            <label className="block text-gray-700 mb-2 font-medium">
              Jornada
            </label>
            <select
              value={jornada}
              onChange={(e) => setJornada(e.target.value)}
              className="bg-primary text-white w-full h-10 rounded-lg px-4 focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="" disabled>
                Seleccione jornada
              </option>
              <option value="AM">AM - 08:00 - 12:00</option>
              <option value="PM">PM - 01:00 - 05:00</option>
            </select>
          </div>
          <div className="grid grid-cols-2 items-center gap-1">
            <div className="w-10 h-10 bg-primary"></div>
            <h4 className="p-0">Cupos llenos</h4>
            <div className="w-10 h-10 bg-red-700"></div>
            <h4 className="p-0">Festivo</h4>
            <div className="w-10 h-10 bg-facultad-azul"></div>
            <h4 className="p-0">Conciliacion</h4>
          </div>
          <button
            className="cursor-pointer bg-primary hover:bg-primary-dark text-white font-bold py-2 px-6 rounded-lg transition w-full"
            onClick={handleSaveTurno}
          >
            SOLICITAR TURNO
          </button>
        </div>
      </div>
    </div>
  );
}
