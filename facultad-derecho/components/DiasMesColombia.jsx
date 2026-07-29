import Holidays from "date-holidays";

export function obtenerCalendarioHabilColombia(anio = new Date().getFullYear(),
  mes = new Date().getMonth() + 1) {

  const hd = new Holidays("CO");
  
  const diasEnElMes = new Date(anio, mes, 0).getDate(); // mes: 1-12
  const nombreMes = new Intl.DateTimeFormat('es-CO', { month: 'long' }).format(new Date(anio, mes - 1));

  const calendarioColombia = [];

  for (let dia = 1; dia <= diasEnElMes; dia++) {
    const fecha = new Date(anio, mes - 1, dia); // mes base 0
    const diaSemanaNumero = fecha.getDay(); // 0 = domingo, 6 = sábado

    if (diaSemanaNumero === 0 || diaSemanaNumero === 6) {
      continue; // Omitir sábados y domingos
    }

    const fechaISO = fecha.toISOString().split("T")[0];
    const diaSemana = new Intl.DateTimeFormat('es-CO', { weekday: 'long' }).format(fecha);
    const esFestivo = !!hd.isHoliday(fecha);

    calendarioColombia.push({
      dia,
      fecha: fechaISO,
      diaSemana,
      esFestivo,
      nombreFestivo: null,
      nombreMes,
      anio
    });
  }

  return calendarioColombia;
}

// 🧪 Ejemplo: Agosto 2025
