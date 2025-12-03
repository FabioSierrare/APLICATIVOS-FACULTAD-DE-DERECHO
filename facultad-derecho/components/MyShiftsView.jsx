"use client";
import React from 'react';
import { CalendarDays, Clock, MapPin } from 'lucide-react';
import RegisterShiftView from './RegisterShiftView';

export default function MyShiftsView() {
  // Datos simulados (esto vendría de tu API)
  const turnos = [
    { id: 1, fecha: '2023-11-15', jornada: 'Mañana (8:00am - 12:00pm)', estado: 'Programado' },
    { id: 2, fecha: '2023-11-22', jornada: 'Tarde (1:00pm - 5:00pm)', estado: 'Completado' },
    { id: 3, fecha: '2023-12-05', jornada: 'Mañana (8:00am - 12:00pm)', estado: 'Pendiente' },
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'Programado': return 'bg-green-100 text-green-700 border-green-200';
      case 'Pendiente': return 'bg-secondary/20 text-yellow-800 border-secondary';
      case 'Completado': return 'bg-gray-100 text-gray-500 border-gray-200';
      default: return 'bg-gray-100';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {turnos.map((turno) => (
        <div key={turno.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100 group">
          
          {/* Header de la Tarjeta */}
          <div className="bg-primary p-4 flex justify-between items-center relative overflow-hidden">
            {/* Decoración de fondo */}
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-secondary rounded-full opacity-20 group-hover:scale-150 transition-transform duration-500"></div>
            
            <div className="flex items-center gap-2 text-white z-10">
              <CalendarDays size={20} className="text-secondary" />
              <span className="font-semibold text-lg">Turno #{turno.id}</span>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold z-10 bg-white/20 text-white backdrop-blur-sm border border-white/30`}>
              {turno.estado}
            </span>
          </div>

          {/* Cuerpo de la Tarjeta */}
          <div className="p-6 space-y-4">
            
            {/* Fecha */}
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold mb-1">Fecha Programada</p>
              <h4 className="text-xl font-bold text-gray-800 capitalize">
                {new Date(turno.fecha + 'T00:00:00').toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h4>
            </div>

            <hr className="border-gray-100"/>

            {/* Jornada */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-50 rounded-lg text-primary">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Jornada</p>
                <p className="font-medium text-gray-700">{turno.jornada}</p>
              </div>
            </div>

             {/* Ubicación (Extra visual) */}
             <div className="flex items-start gap-3">
              <div className="p-2 bg-yellow-50 rounded-lg text-yellow-700">
                <MapPin size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Sede</p>
                <p className="font-medium text-gray-700">Sede Principal</p>
              </div>
            </div>

          </div>
          
          {/* Footer Tarjeta */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
             <button className="text-sm font-bold text-primary hover:text-secondary transition-colors">
               Ver Detalles &rarr;
             </button>
          </div>
        </div>
      ))}
    </div>
  );
}