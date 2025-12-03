"use client";
import React from "react";
import RegisterShiftView from "@/components/RegisterShiftView";

export default function Home() {
  return (
    <main className="flex-1 p-4 md:p-8">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-primary border-l-4 border-secondary pl-4">
          Programación de Turnos
        </h2>
        <p className="text-gray-500 mt-2 pl-4">Selecciona una fecha disponible en el calendario y confirma tu turno.</p>
      </header>

      <RegisterShiftView />
    </main>
  );
}
