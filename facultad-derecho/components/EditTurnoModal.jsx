"use client";

import React from "react";
import { X, CalendarDays, Clock, Save, Edit3 } from "lucide-react";
import DatePickerWithBlocks from "./Calendario";
import Jornada from "./Jornada";

export default function EditTurnoModal({ 
  open, 
  turno, 
  onClose, 
  onSave, 
  calendarioActual, 
  setCalendarioActual 
}) {
  const [selectedDate, setSelectedDate] = React.useState(turno?.fecha ? new Date(turno.fecha) : null);
  const [jornada, setJornada] = React.useState(turno?.jornada || turno?.jornadaId || 'Mañana');

  React.useEffect(() => {
    if (open) {
      setSelectedDate(turno?.fecha ? new Date(turno.fecha) : null);
      setJornada(turno?.jornada || turno?.jornadaId || 'Mañana');
    }
  }, [turno, open]);

  if (!open) return null;

  const handleSave = () => {
    onSave({ 
      ...turno, 
      fecha: selectedDate ? selectedDate.toISOString() : turno?.fecha, 
      jornada 
    });
  };

  return (
    // Backdrop: Fijo, centrado, con padding para los márgenes
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 transition-opacity duration-300">
      
      {/* Modal Container principal
        max-h-screen: Limita la altura al alto de la pantalla (Viewport Height)
        my-8: Crea el margen vertical arriba y abajo
        overflow-y-auto: Permite que el contenido del modal haga scroll si es necesario
      */}
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-90 border-t-4 border-[#FFCE21] max-h-screen my-8 overflow-y-auto mt-10"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        
        {/* --- Header (Fijo) --- */}
        <div className="sticky top-0 z-10 px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white">
          <h3 id="modal-title" className="text-xl font-bold text-[#553285] flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-[#FFCE21]" />
            Editar Turno
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* --- Body (Contenido) --- */}
        {/* Aquí va tu contenido. Si es muy largo, este div hará scroll junto con el contenedor principal */}
        <div className="p-8 space-y-6">
          
          {/* Ejemplo de Campo de Fecha */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <CalendarDays className="w-4 h-4 text-[#553285]" />
              Fecha del Turno
            </label>
            {/* Se asume que DatePickerWithBlocks puede ser alto */}
              <div className="p-1 border border-gray-100 rounded-lg">
              <DatePickerWithBlocks 
                selected={selectedDate}
                onSelect={setSelectedDate} 
                onLoadCalendario={(c) => {
                  // Asegurarnos de guardar sólo el id del calendario (no el objeto completo)
                  try {
                    const id = c && (c.id ?? c);
                    setCalendarioActual(typeof id === 'number' ? id : Number(id));
                  } catch (e) {
                    // en caso de duda, no tocar el calendario
                    console.warn('onLoadCalendario: valor inesperado', c);
                  }
                }}
                calendarioActivoId={calendarioActual} 
              />
            </div>
          </div>

          {/* Ejemplo de Campo de Jornada */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Clock className="w-4 h-4 text-[#553285]" />
              Jornada Laboral
            </label>
            <div className="p-1">
              <Jornada 
                value={jornada} 
                onChange={setJornada} 
              />
            </div>
          </div>
          

        </div>

        {/* --- Footer (Fijo) --- */}
        <div className="sticky bottom-0 z-10 bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          
          <button 
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl text-sm font-medium bg-[#553285] text-white hover:bg-[#42256a] shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Guardar Cambios
          </button>
        </div>

      </div>
    </div>
  );
}