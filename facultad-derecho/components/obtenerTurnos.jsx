export function obtenerSemanas(calendario, diaConciliacion) {
  const inicio = new Date(calendario.fechaInicio);
  const fin = new Date(calendario.fechaFin);

  const semanas = [];
  let semanaActual = [];
  let fecha = new Date(inicio);

  const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

  while (fecha <= fin) {
    const diaNombre = diasSemana[fecha.getDay()];

    // Solo lunes a viernes, excluyendo el día de conciliación
    const esDiaLaboral = diaNombre !== "Sábado" && diaNombre !== "Domingo" && diaNombre !== diaConciliacion;

    if (esDiaLaboral) {
      semanaActual.push({
        fecha: new Date(fecha),
        dia: diaNombre,
      });
    }

    // Cerrar semana al llegar a viernes o al final del calendario
    if (diaNombre === "Viernes" || fecha.getTime() === fin.getTime()) {
      if (semanaActual.length > 0) {
        semanas.push(semanaActual);
        semanaActual = [];
      }
    }

    fecha.setDate(fecha.getDate() + 1);
  }

  return semanas;
}
