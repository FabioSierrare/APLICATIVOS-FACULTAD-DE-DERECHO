'use client';

export const CalendarHeader = ({ mes, año, cambiarMes }) => {
  const nombreMes = new Date(año, mes - 1).toLocaleString('es-CO', { month: 'long' });
  const mesCapitalizado = nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1);

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-primary text-white">
      <button 
        onClick={() => cambiarMes(-1)}
        className="p-2 rounded-full hover:bg-primary-dark transition flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="ml-1 hidden sm:inline">Anterior</span>
      </button>
      
      <div className="text-center">
        <h2 className="text-xl font-semibold">
          {mesCapitalizado} {año}
        </h2>
        <p className="text-sm opacity-80">Días consultorio (L-V)</p>
      </div>
      
      <button 
        onClick={() => cambiarMes(1)}
        className="p-2 rounded-full hover:bg-primary-dark transition flex items-center"
      >
        <span className="mr-1 hidden sm:inline">Siguiente</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};