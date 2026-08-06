"use client";

import { CrearTurnoEstudianteDTO } from "@/Model/Turnos/CrearTurnoEstudianteDTO";
import { useEffect, useState } from "react";
import DatePickerWithBlocksStudent from "../CalendarioStudent";
import { Clock, CheckCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ObtenerIdUsuario } from "../ObtenerIdUsuario";
import { postData } from "../FetchPost";
import { useRouter } from "next/navigation";
import AlertModal from "../AlertModal";
import { AlertModalProps } from "@/Model/AlertModalProps";
import { Respuesta } from "@/Model/Respuesta";

export default function RegistroTurnosEstudiante() {
  const [selectedDate, setselectedDate] = useState(undefined);
  const [btnloading, setbtnloading] = useState(false);
  const [AlertActive, setAlertActive] = useState(false);
  const [alert, setAlert] = useState<AlertModalProps>({
    title: "",
    message: "",
    buttonText: "",
    type: "info",
  });
  const userid = ObtenerIdUsuario();

  const router = useRouter();

  const [Enviar, setEnviar] = useState<CrearTurnoEstudianteDTO>({
    fecha: null,
    jornada: "",
    usuario_id: 0,
  });

  //Guardar datos a enviar
  const handlerChange = (nombre: string, value: any) => {
    setEnviar((prev) => ({
      ...prev,
      [nombre]: value,
    }));
  };

  //Guardar info para obtener la info
  useEffect(() => {
    if (!userid || !selectedDate) return;

    handlerChange("fecha", new Date(selectedDate.date));
    handlerChange("usuario_id", userid);
  }, [selectedDate, userid]);

  const handleAlertClose = () => {
    if (alert.type === "success") {
      window.location.reload();
      return;
    }

    setAlertActive(false);
    setAlert({
      title: "",
      message: "",
      buttonText: "",
      type: "info",
    });
  };

  //Enviar datos al servidor
  const handleSubmit = async () => {
    if (btnloading) return;
    setbtnloading(true);

    if (!Enviar.fecha || !Enviar.jornada || !Enviar.usuario_id) {
      setAlert({
        title: "Datos incompletos",
        message: "Selecciona una fecha y una jornada antes de continuar.",
        buttonText: "Entendido",
        type: "warning",
      });
      setAlertActive(true);
      setbtnloading(false);
      return;
    }

    try {
      const respuesta: Respuesta = await postData(
        "/api/Turnos/PostTurnos",
        Enviar,
      );

      setAlert({
        title: "Confirmación de turno",
        message: respuesta.message,
        buttonText: "Aceptar",
        type: "success",
      });
      setAlertActive(true);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "No se pudo completar la solicitud.";

      setAlert({
        title: "No se pudo procesar el turno",
        message: errorMessage,
        buttonText: "Entendido",
        type: "error",
      });
      setAlertActive(true);
    } finally {
      setbtnloading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <AlertModal
        isOpen={AlertActive}
        title={alert.title}
        message={alert.message}
        buttonText={alert.buttonText || "Aceptar"}
        type={alert.type || "info"}
        onAccept={handleAlertClose}
      />
      {/* Columna Izquierda: Calendario */}
      <div className="lg:col-span-6 flex flex-col items-center">
        <div className="bg-white p-4 rounded-3xl shadow-xl border border-gray-100 w-full max-w-md flex justify-center">
          <DatePickerWithBlocksStudent
            selected={selectedDate}
            onSelect={setselectedDate}
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
                      selectedDate.disponibilidad?.AM &&
                      handlerChange("jornada", "AM")
                    }
                    className={`p-4 rounded-xl border-2 transition-all text-sm font-medium
                          ${
                            !selectedDate.disponibilidad?.AM
                              ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                              : Enviar.jornada === "AM"
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
                      selectedDate.disponibilidad?.PM &&
                      handlerChange("jornada", "PM")
                    }
                    className={`p-4 rounded-xl border-2 transition-all text-sm font-medium
                          ${
                            !selectedDate.disponibilidad?.PM
                              ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                              : Enviar.jornada === "PM"
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
                disabled={!Enviar.jornada || btnloading}
                className={`
                      w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 
                      transition-transform active:scale-95
                      ${
                        !Enviar.jornada || btnloading
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/30"
                      }
                    `}
              >
                {btnloading ? (
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
