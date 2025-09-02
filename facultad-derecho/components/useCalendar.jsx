'use client';

import { useState, useEffect } from 'react';
import { obtenerCalendarioHabilColombia } from './DiasMesColombia';
import useFetchData from "@/components/FetchData";
import { useUsuarioTurno } from './UsuarioData';

export const useCalendar = (initialMonth, initialYear, jornadaSeleccionada) => {
  const [mes, setMes] = useState(initialMonth);
  const [año, setAño] = useState(initialYear);
  const [diasDelMes, setDiasDelMes] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);

  const { data: calendario } = useFetchData("/api/Calendarios/GetCalendarios");
  const { data: LimitesTurnos } = useFetchData("/api/LimitesTurnosConsultorio/GetLimitesTurnosConsultorio");
  const { data: Turnos } = useFetchData("/api/Turnos/GetTurnos");
  const { data: configuracionDias } = useFetchData("/api/ConfiguracionDias/GetConfiguracionDias");
  const { usuarioId, consultorioId, calendarioId } = useUsuarioTurno();

  const compararFechas = (f1, f2) => {
  const d1 = new Date(f1).toISOString().split("T")[0];
  const d2 = new Date(f2).toISOString().split("T")[0];
  return d1.localeCompare(d2);
};


  const cambiarMes = (incremento) => {
    let nuevoMes = mes + incremento;
    let nuevoAño = año;

    if (nuevoMes > 12) {
      nuevoMes = 1;
      nuevoAño++;
    } else if (nuevoMes < 1) {
      nuevoMes = 12;
      nuevoAño--;
    }

    setMes(nuevoMes);
    setAño(nuevoAño);
  };

  

  useEffect(() => {
     if (!usuarioId  || !mes || !año || !LimitesTurnos || !consultorioId || !calendarioId || !configuracionDias || !Turnos || !calendario) return;
    const cargarDias = async () => {
      // Obtener días del mes, aunque no haya turnos
      const dias = await obtenerCalendarioHabilColombia(año, mes);
      const diaABloquear = calendario?.[calendario.length - 1] || {};


      const diasActualizados = dias.map(day => {
        const formatearFecha = (fecha) => new Date(fecha).toISOString().split('T')[0];
        const diaSemanaMinuscula = day.diaSemana.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

        // Turno del usuario en ese día
        const tieneTurnoElUsuario = Turnos?.some(
          t => t.usuarioId === usuarioId &&
               formatearFecha(t.fecha) === formatearFecha(day.fecha)
        ) || false;

        
        // Configuración del día según calendario y día de la semana
        const configDia = configuracionDias?.find(
    c => c.calendarioId === calendarioId &&
         c.diaSemana
           .normalize('NFD')
           .replace(/[\u0300-\u036f]/g, '')
           .toLowerCase() === diaSemanaMinuscula
  ) || { maxTurnosAM: Infinity, maxTurnosPM: Infinity };

  
  

const turnosAM = Turnos?.filter(
  t => t.calendarioId === calendarioId &&
       t.jornada === "AM" &&
       formatearFecha(t.fecha) === formatearFecha(day.fecha)
).length || 0;


const turnosPM = Turnos?.filter(
  t => t.calendarioId === calendarioId &&
       t.jornada === "PM" &&
       formatearFecha(t.fecha) === formatearFecha(day.fecha)
).length || 0;




// Bloqueo según jornada seleccionada


  // 🚨 Si no se ha seleccionado jornada, el día se bloquea automáticamente
const bloqueadoPorLimiteJornada =
  !jornadaSeleccionada
    ? true
    : jornadaSeleccionada === "AM"
      ? turnosAM >= configDia.maxTurnosAM
      : jornadaSeleccionada === "PM"
        ? turnosPM >= configDia.maxTurnosPM
        : false;


        // Límite global de turnos por consultorio/calendario
        const limite = LimitesTurnos?.find(
          l => l.consultorioId === consultorioId && l.calendarioId === calendarioId
        )?.limiteTurnos || Infinity;

        const totalTurnos = Turnos?.filter(
  t => t.usuarioId === usuarioId &&
       t.calendarioId === calendarioId).length || 0;
       

        return {
          ...day,
          bloqueadoPorDiaSemana: diaSemanaMinuscula === (diaABloquear?.diaConciliacion?.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() || ''),
          bloqueadoPorFecha:
            (diaABloquear?.fechaInicio && compararFechas(day.fecha, diaABloquear.fechaInicio) < 0) ||
            compararFechas(day.fecha, new Date()) < 0 ||
            (diaABloquear?.fechaFin && compararFechas(day.fecha, diaABloquear.fechaFin) > 0),
          bloqueadoPorLimite: totalTurnos >= limite,
          bloqueadoPorUsuario: tieneTurnoElUsuario,
          bloqueadoPorLimiteJornada,
        };
      });

      setDiasDelMes(diasActualizados);
      setSelectedDay(null);
    };

    cargarDias();
  }, [mes, año, calendario, LimitesTurnos, Turnos, consultorioId, calendarioId, usuarioId, configuracionDias, jornadaSeleccionada]);

  return {
    mes,
    año,
    diasDelMes,
    selectedDay,
    cambiarMes,
    setSelectedDay,
  };
};
