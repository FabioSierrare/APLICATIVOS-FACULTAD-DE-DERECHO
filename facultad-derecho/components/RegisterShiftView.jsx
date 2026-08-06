"use client";
import React, { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Clock, CheckCircle, AlertCircle } from "lucide-react";
import DatePickerWithBlocksStudent from "./CalendarioStudent";
import { useUsuarioTurno } from "./UsuarioData";
import { useRouter } from "next/navigation";
import { postData } from "./FetchPost";
import AlertModal from "./AlertModal";

export default function () {
  const [selectedDate, setSelectedDate] = useState(undefined);
  const [jornada, setJornada] = useState("");
  const [loading, setLoading] = useState(false);
  const [btnloading, setbtnloading] = useState(false)
  const { usuarioId, consultorioId, calendarioId } = useUsuarioTurno();
  const router = useRouter();

  const handleSubmit = async () => {
    if(btnloading) return
    setbtnloading(true)


    if (
      !selectedDate?.date ||
      !jornada ||
      !usuarioId ||
      !consultorioId ||
      !calendarioId
    )
      return;

    const enviar = {
      UsuarioId: usuarioId,
      ConsultorioId: consultorioId,
      Fecha: new Date(selectedDate.date),
      Jornada: jornada,
      CalendarioId: calendarioId,
    };


    try {
      const respuesta = await postData("/api/Turnos/PostTurnos", enviar);
      if (!respuesta) {
        throw new Error("Los cupos para esta jorna se llenaron por completo");
      }

      alert("Turno guardado con éxito");
      
      router.push("/home/turnos");
    } catch (error) {
      alert("Los cupos para esta jorna se llenaron por completo");
      window.location.reload()
    } finally {
      setbtnloading(false)
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Columna Izquierda: Calendario */}
      <div className="lg:col-span-6 flex flex-col items-center">
        <div className="bg-white p-4 rounded-3xl shadow-xl border border-gray-100 w-full max-w-md flex justify-center">
          <DatePickerWithBlocksStudent
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="w-full"
          />
        </div>

        {/* Leyenda de colores */}
        <div className="mt-4 flex gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            Seleccionado
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-100 border border-red-300 rounded-full"></div>
            No disponible
          </div>
        </div>
      </div>

      {/* Columna Derecha */}
      <div className="lg:col-span-6">
        <div className="bg-white rounded-3xl shadow-lg border-t-8 border-secondary p-8 h-full">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Clock className="text-primary" />
            Detalles del Agendamiento
          </h3>

          {!selectedDate ? (
            <div className="h-40 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
              <AlertCircle size={32} className="mb-2" />
              <p>Por favor selecciona una fecha en el calendario</p>
            </div>
          ) : (
            <div className="space-y-6 animate-pulse-once">
              {/* Información de Fecha Seleccionada */}
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                <span className="text-xs font-bold text-primary uppercase tracking-wider">
                  Fecha Seleccionada
                </span>

                <p className="text-2xl font-bold text-gray-800 capitalize">
                  {format(selectedDate.date, "EEEE, d 'de' MMMM 'de' yyyy", {
                    locale: es,
                  })}
                </p>

                {/* Mostrar disponibilidad */}
                <div className="mt-2 text-sm">
                  <p>
                    <strong>AM:</strong>{" "}
                    {selectedDate.disponibilidad?.AM
                      ? "Disponible"
                      : "No disponible"}
                  </p>
                  <p>
                    <strong>PM:</strong>{" "}
                    {selectedDate.disponibilidad?.PM
                      ? "Disponible"
                      : "No disponible"}
                  </p>
                </div>
              </div>

              {/* Selección de Jornada */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Selecciona la Jornada
                </label>

                <div className="grid grid-cols-2 gap-4">
                  {/* AM */}
                  <button
                    disabled={!selectedDate.disponibilidad?.AM}
                    onClick={() =>
                      selectedDate.disponibilidad?.AM && setJornada("AM")
                    }
                    className={`p-4 rounded-xl border-2 transition-all text-sm font-medium
                      ${
                        !selectedDate.disponibilidad?.AM
                          ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                          : jornada === "AM"
                          ? "border-primary bg-primary/5 text-primary shadow-sm"
                          : "border-gray-200 hover:border-secondary text-gray-600"
                      }`}
                  >
                    Mañana (8:00am - 12:00pm)
                  </button>

                  {/* PM */}
                  <button
                    disabled={!selectedDate.disponibilidad?.PM}
                    onClick={() =>
                      selectedDate.disponibilidad?.PM && setJornada("PM")
                    }
                    className={`p-4 rounded-xl border-2 transition-all text-sm font-medium
                      ${
                        !selectedDate.disponibilidad?.PM
                          ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                          : jornada === "PM"
                          ? "border-primary bg-primary/5 text-primary shadow-sm"
                          : "border-gray-200 hover:border-secondary text-gray-600"
                      }`}
                  >
                    Tarde (1:00pm - 5:00pm)
                  </button>
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Botón de Acción */}
              <button
                onClick={handleSubmit}
                disabled={!jornada || loading || btnloading}
                className={`
                  w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 
                  transition-transform active:scale-95
                  ${
                    !jornada || loading || btnloading
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/30"
                  }
                `}
              >
                {loading ? (
                  "Procesando..."
                ) : (
                  <>
                    Confirmar Turno <CheckCircle size={20} />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
