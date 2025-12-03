"use client";

import React from "react";
import TurnoCard from "./TurnoCard";

export default function TurnosList({ turnos = [], onEditTurno }) {
  if (!Array.isArray(turnos) || turnos.length === 0) {
    return <div className="text-sm text-gray-500">No hay turnos actuales</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      {turnos.map((t) => (
        <TurnoCard key={t.id || t.turnoId || `${t.fecha}-${t.jornada}`} turno={t} onEdit={onEditTurno} />
      ))}
    </div>
  );
}
