"use client";
import useFetchData from "@/components/FetchData";
import { useState, useEffect } from "react";
import { useUsuarioTurno } from "@/components/UsuarioData";
import { CalendarDays, Clock, MapPin } from 'lucide-react';
import CalendarSkeleton from "@/components/cargando";
export const runtime = "edge"


export default function TurnoCard() {
  const { data: Turnos } = useFetchData("/api/Turnos/GetTurnos");
  const [misTurnos, setmisTurnos] = useState([]);
  const { usuarioId, consultorioId, calendarioId } = useUsuarioTurno();

  useEffect(() => {
    if (!Turnos || !usuarioId || !calendarioId) return;

    const misTurno = Turnos.filter((t) => t.usuarioId === usuarioId && t.calendarioId === calendarioId);
    setmisTurnos(misTurno);

  }, [Turnos, usuarioId, calendarioId]);

  if(!Turnos) return <CalendarSkeleton />;

  const opciones = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  };

  return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {misTurnos.map((turno, idx) => {
          const fechaObj = new Date(turno.fecha);

          // Solo fecha en formato colombiano
          const fechaColombia = fechaObj.toLocaleDateString("es-CO", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });

          // Fecha con nombre del día y mes
          const fechaFormateada = fechaObj.toLocaleDateString("es-CO", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          });

          return (
          <div key={turno.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100 group">
            
            {/* Header de la Tarjeta */}
            <div className="bg-primary p-4 flex justify-between items-center relative overflow-hidden">
              {/* Decoración de fondo */}
              <div className="absolute -right-4 -top-4 w-16 h-16 bg-secondary rounded-full opacity-20 group-hover:scale-150 transition-transform duration-500"></div>
              
              <div className="flex items-center gap-2 text-white z-10">
                <CalendarDays size={20} className="text-secondary" />
                <span className="font-semibold text-lg">Turno {fechaColombia}</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold z-10 bg-white/20 text-white backdrop-blur-sm border border-white/30`}>
                {idx + 1}
              </span>
            </div>
  
            {/* Cuerpo de la Tarjeta */}
            <div className="p-6 space-y-4">
              
              {/* Fecha */}
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Fecha Programada</p>
                <h4 className="text-xl font-bold text-gray-800 capitalize">
                  {fechaFormateada}
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
                  <p className="font-medium text-gray-700">CALLE 34</p>
                </div>
              </div>
  
            </div>
            
          </div>
        )})}
      </div>
    );
}
