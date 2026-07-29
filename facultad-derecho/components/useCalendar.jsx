"use client";
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';
import DatePickerWithBlocksStudent from './CalendarioStudent';
import useFetchData from "@/components/FetchData"; // Asumiendo que lo tienes disponible
import { useUsuarioTurno } from './UsuarioData'; // Asumiendo que lo tienes disponible

export default function RegisterShiftView() {
  const [selectedDate, setSelectedDate] = useState();
  const [jornada, setJornada] = useState('');
  const [loading, setLoading] = useState(false);

  // Obtén datos necesarios para calcular disponibilidad (igual que en useCalendar)
  const { data: calendario } = useFetchData("/api/Calendarios/GetCalendarios");
  const { data: LimitesTurnos } = useFetchData("/api/LimitesTurnosConsultorio/GetLimitesTurnosConsultorio");
  const { data: Turnos } = useFetchData("/api/Turnos/GetTurnos");
  const { data: configuracionDias } = useFetchData("/api/ConfiguracionDias/GetConfiguracionDias");
  const { usuarioId, consultorioId, calendarioId } = useUsuarioTurno();

  // Función auxiliar para verificar si una jornada está disponible para una fecha
  const esJornadaDisponible = (fecha, jornada) => {
    if (!fecha || !jornada || !Turnos || !configuracionDias || !LimitesTurnos || !calendario || !usuarioId || !consultorioId || !calendarioId) {
      return false; // Si faltan datos, asume no disponible
    }

    const formatearFecha = (f) => new Date(f).toISOString().split('T')[0];
    const diaSemanaMinuscula = new Date(fecha).toLocaleDateString('es-CO', { weekday: 'long' })
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

    const diaABloquear = calendario?.[calendario.length - 1] || {};

    // Bloqueos básicos (igual que en useCalendar)
    const bloqueadoPorDiaSemana = diaSemanaMinuscula === (diaABloquear?.diaConciliacion?.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() || '');
    const bloqueadoPorFecha =
      (diaABloquear?.fechaInicio && new Date(fecha) < new Date(diaABloquear.fechaInicio)) ||
      (new Date(fecha) < new Date()) ||
      (diaABloquear?.fechaFin && new Date(fecha) > new Date(diaABloquear.fechaFin));

    if (bloqueadoPorDiaSemana || bloqueadoPorFecha) return false;

    // Turno del usuario en ese día y jornada (permitir diferente jornada)
    const tieneTurnoEnLaMismaJornada = Turnos.some(
      t => t.usuarioId === usuarioId && formatearFecha(t.fecha) === formatearFecha(fecha) && t.jornada === jornada
    );
    if (tieneTurnoEnLaMismaJornada) return false;

    // Límite global de turnos por usuario
    const limite = LimitesTurnos.find(
      l => l.consultorioId === consultorioId && l.calendarioId === calendarioId
    )?.limiteTurnos || Infinity;
    const totalTurnosUsuario = Turnos.filter(
      t => t.usuarioId === usuarioId && t.calendarioId === calendarioId
    ).length;
    if (totalTurnosUsuario >= limite) return false;

    // Configuración del día
    const configDia = configuracionDias.find(
      c => c.calendarioId === calendarioId &&
           c.diaSemana.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() === diaSemanaMinuscula
    ) || { maxTurnosAM: Infinity, maxTurnosPM: Infinity };

    // Conteo de turnos por jornada
    const turnosAM = Turnos.filter(
      t => t.calendarioId === calendarioId && t.jornada === "AM" && formatearFecha(t.fecha) === formatearFecha(fecha)
    ).length;
    const turnosPM = Turnos.filter(
      t => t.calendarioId === calendarioId && t.jornada === "PM" && formatearFecha(t.fecha) === formatearFecha(fecha)
    ).length;

    // Bloqueo por límite de jornada
    if (jornada === "AM" && turnosAM >= configDia.maxTurnosAM) return false;
    if (jornada === "PM" && turnosPM >= configDia.maxTurnosPM) return false;

    return true; // Disponible
  };

  // Jornadas disponibles dinámicas (calculadas cuando selectedDate cambia)
  const jornadasDisponibles = selectedDate
    ? ["AM", "PM"].filter(j => esJornadaDisponible(selectedDate, j))
    : []; // Vacío si no hay fecha seleccionada

  const handleSubmit = () => {
    if (!selectedDate || !jornada) return;
    if (!(selectedDate instanceof Date) || isNaN(selectedDate.getTime())) {
      alert("Fecha seleccionada inválida. Por favor selecciona una fecha válida.");
      return;
    }
    setLoading(true);

    setTimeout(() => {
      const texto = jornada === "AM"
        ? "Mañana (8:00am - 12:00pm)"
        : "Tarde (1:00pm - 5:00pm)";

      alert(`Turno agendado para el ${format(selectedDate, 'PPP', { locale: es })} en la ${texto}`);

      setLoading(false);
      setSelectedDate(undefined);
      setJornada('');
    }, 1500);
  };

  // Helper function to safely format dates
  const safeFormat = (date, formatStr, options = {}) => {
    if (date instanceof Date && !isNaN(date.getTime())) {
      return format(date, formatStr, options);
    }
    return "Fecha inválida";
  };


  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      
      {/* Columna izquierda */}
      <div className="lg:col-span-6 flex flex-col items-center">
        <div className="bg-white p-4 rounded-3xl shadow-xl border border-gray-100 w-full max-w-md flex justify-center">
          <DatePickerWithBlocksStudent 
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="w-full"
            // Si DatePickerWithBlocksStudent usa useCalendar, puedes pasar jornadaSeleccionada aquí si es necesario,
            // pero como ahora es dinámico, no es obligatorio. Si lo necesitas, pásalo como null inicialmente.
          />
        </div>

        <div className="mt-4 flex gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>Seleccionado
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-100 border border-red-300 rounded-full"></div>No disponible
          </div>
        </div>
      </div>

      {/* Columna derecha */}
      <div className="lg:col-span-6">
        <div className="bg-white rounded-3xl shadow-lg border-t-8 border-secondary p-8 h-full">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Clock className="text-primary" />
            Detalles del Agendamiento
          </h3>

          {!selectedDate ? (
            <div className="h-40 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
              <AlertCircle size={32} className="mb-2"/>
              <p>Por favor selecciona una fecha en el calendario</p>
            </div>
          ) : (
            <div className="space-y-6 animate-pulse-once">
              
              {/* Fecha Seleccionada */}
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                <span className="text-xs font-bold text-primary uppercase tracking-wider">
                  Fecha Seleccionada
                </span>
                <p className="text-2xl font-bold text-gray-800 capitalize">
                  {safeFormat(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                </p>
              </div>

              {/* Jornadas */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Selecciona la Jornada
                </label>

                <div className="grid grid-cols-2 gap-4">
                  {/* AM */}
                  <button
                    disabled={!jornadasDisponibles.includes("AM")}
                    onClick={() => jornadasDisponibles.includes("AM") && setJornada("AM")}
                    className={`p-4 rounded-xl border-2 transition-all text-sm font-medium
                      ${!jornadasDisponibles.includes("AM") 
                        ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed" 
                        : jornada === "AM"
                          ? "border-primary bg-primary/5 text-primary shadow-sm"
                          : "border-gray-200 hover:border-secondary text-gray-600"
                      }`}
                  >
                    Mañana (8:00am - 12:00pm)
                  </button>

                  {/* PM */}
                  <button
                    disabled={!jornadasDisponibles.includes("PM")}
                    onClick={() => jornadasDisponibles.includes("PM") && setJornada("PM")}
                    className={`p-4 rounded-xl border-2 transition-all text-sm font-medium
                      ${!jornadasDisponibles.includes("PM") 
                        ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed" 
                        : jornada === "PM"
                          ? "border-primary bg-primary/5 text-primary shadow-sm"
                          : "border-gray-200 hover:border-secondary text-gray-600"
                      }`}
                  >
                    Tarde (1:00pm - 5:00pm)
                  </button>
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Botón Confirmar */}
              <button
                onClick={handleSubmit}
                disabled={!jornada || loading}
                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-transform active:scale-95
                  ${!jornada || loading 
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/30"
                  }`}
              >
                {loading ? "Procesando..." : <>Confirmar Turno <CheckCircle size={20}/></>}
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
