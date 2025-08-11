"use client";
import { useCalendar } from "@/components/useCalendar";
import { CalendarHeader } from "@/components/CalendarHeader";
import { DayCell } from "@/components/DayCell";

export default function Home() {
  const fechaActual = new Date();
  const { mes, año, diasDelMes, selectedDay, cambiarMes, setSelectedDay } =
    useCalendar(fechaActual.getMonth() + 1, fechaActual.getFullYear());

  const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

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
            <select className="bg-primary text-white w-full h-10 rounded-lg px-4 focus:outline-none focus:ring-2 focus:ring-primary/50">
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
            className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-6 rounded-lg transition w-full"
            type="submit"
          >
            SOLICITAR TURNO
          </button>
        </div>
      </div>
    </div>
  );
}
