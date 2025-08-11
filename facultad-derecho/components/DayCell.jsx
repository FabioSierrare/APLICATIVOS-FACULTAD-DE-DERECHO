'use client';

export const DayCell = ({ 
  diasDelMes,
  selectedDay,
  setSelectedDay
}) => {
  if (diasDelMes.length === 0) return null;

  const primerDia = diasDelMes[0];
  const diasSemana = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'];
  const espaciosVacios = diasSemana.indexOf(primerDia.diaSemana.toLowerCase());

  const handleSelect = (day) => {
    if (!day.esFestivo) {
      setSelectedDay(day.fecha);
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
        const isSelected = selectedDay === day.fecha;
        const isFestivo = day.esFestivo;

        return (
          <div
            key={day.fecha}
            onClick={() => handleSelect(day)}
            className={`h-16 flex items-center justify-center rounded-lg border text-sm transition
              ${
                isFestivo
                  ? 'bg-red-700 text-white opacity-60 cursor-not-allowed'
                  : `hover:bg-primary/15 text-primary cursor-pointer`
              }
              ${
                isSelected && !isFestivo
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