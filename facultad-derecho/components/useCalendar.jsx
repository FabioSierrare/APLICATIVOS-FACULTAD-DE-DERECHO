'use client';

import { useState, useEffect } from 'react';
import { obtenerCalendarioHabilColombia } from './DiasMesColombia';

export const useCalendar = (initialMonth, initialYear) => {
  const [mes, setMes] = useState(initialMonth);
  const [año, setAño] = useState(initialYear);
  const [diasDelMes, setDiasDelMes] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);

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
    const cargarDias = async () => {
      const dias = await obtenerCalendarioHabilColombia(año, mes);
      setDiasDelMes(dias);
      setSelectedDay(null);
    };
    cargarDias();
  }, [mes, año]);

  return {
    mes,
    año,
    diasDelMes,
    selectedDay,
    cambiarMes,
    setSelectedDay,
  };
};