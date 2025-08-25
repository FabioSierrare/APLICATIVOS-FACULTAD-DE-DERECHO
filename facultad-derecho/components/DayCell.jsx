'use client';

export const DayCell = ({ diasDelMes, selectedDay, setSelectedDay }) => {
  if (diasDelMes.length === 0) return null;

  const primerDia = diasDelMes[0];
  const diasSemana = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'];
  
  const primerDiaIndex = diasSemana.findIndex(
    d => d.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() === 
         primerDia.diaSemana.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  );

  const espaciosVacios = primerDiaIndex >= 0 ? primerDiaIndex : 0;

  const handleSelect = (day) => {
    if (!day.esFestivo && !day.bloqueadoPorFecha && !day.bloqueadoPorDiaSemana && !day.bloqueadoPorUsuario && !day.bloqueadoPorLimiteJornada && !day.bloqueadoPorLimite) {
      setSelectedDay(new Date(day.fecha).toISOString());
    }
  };

  return (
    <>
      {/* Espacios vacíos antes del primer día */}
      {Array.from({ length: espaciosVacios }).map((_, index) => (
        <div key={`empty-${index}`} className="h-16"></div>
      ))}

      {/* Días hábiles */}
      {diasDelMes.map((day) => {
        const isSelected = selectedDay && new Date(selectedDay).toDateString() === new Date(day.fecha).toDateString();
        const isFestivo = day.esFestivo;

        return (
          <div
            key={day.fecha}
            onClick={() => handleSelect(day)}
            className={`h-16 flex items-center justify-center rounded-lg border text-sm transition
              ${
                isFestivo || day.bloqueadoPorDiaSemana || day.bloqueadoPorFecha || day.bloqueadoPorUsuario || day.bloqueadoPorLimiteJornada || day.bloqueadoPorLimite
                  ? 'bg-tercer-text text-white opacity-60 cursor-not-allowed'
                  : `hover:bg-primary/15 text-primary cursor-pointer`
              }
              ${
                isSelected && !isFestivo && !day.bloqueadoPorDiaSemana && !day.bloqueadoPorFecha && !day.bloqueadoPorUsuario && !day.bloqueadoPorLimiteJornada
                  ? 'bg-primary/15 text-primary font-semibold border-2 border-primary'
                  : ''
              }
            `}
          >
            {day.dia}
          </div>
        );
      })}
    </>
  );
};
