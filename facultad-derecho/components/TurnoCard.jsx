"use client";

import React from "react";
import { Edit2 } from "lucide-react";

export default function TurnoCard({ turno, onEdit }) {
  const isFinalizado = turno?.estado === "finalizado" || turno?.finalizado;
  const badgeClass = isFinalizado ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700";

  return (
    <div className="flex items-center justify-between bg-white p-3 rounded-lg border shadow-sm">
      <div>
        <div className="text-sm font-medium">{new Date(turno.fecha).toLocaleDateString()}</div>
        <div className="text-xs text-gray-500">{turno.jornada || turno.jornadaId}</div>
      </div>

      <div className="flex items-center gap-3">
        <div className={`px-2 py-1 rounded-md text-xs font-semibold ${badgeClass}`}>{isFinalizado ? 'Finalizado' : 'Activo'}</div>
        <button type="button" onClick={() => onEdit && onEdit(turno)} className="p-2 rounded-md hover:bg-gray-100">
          <Edit2 className="w-4 h-4 text-[#553285]" />
        </button>
      </div>
    </div>
  );
}
