"use client";

import useFetchData from "@/components/FetchData";
import { useState } from "react";
import { Combobox } from "@headlessui/react";
import { postData } from "@/components/FetchPost";

export default function Prueba() {
  const { data: usuarios2 } = useFetchData("/api/Usuarios/GetUsuarios");
  const { data: turnos, fetchData } = useFetchData("/api/Turnos/GetTurnos");

  const [selectedPersonA, setSelectedPersonA] = useState(null);
  const [selectedPersonB, setSelectedPersonB] = useState(null);
  const [selectedTurnoA, setSelectedTurnoA] = useState(null);
  const [selectedTurnoB, setSelectedTurnoB] = useState(null);
  const [queryA, setQueryA] = useState("");
  const [queryB, setQueryB] = useState("");
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const [alertInfo, setAlertInfo] = useState(null);

  const showAlert = (type, message) => {
    setAlertInfo({ type, message });
    setTimeout(() => {
      setAlertInfo(null);
    }, 4000);
  };

  if (!usuarios2 || !turnos) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          <p className="text-white font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  const usuarios = usuarios2.filter((u) => u.rolId === 2);

  const filteredA =
    queryA === ""
      ? usuarios
      : usuarios.filter((p) =>
          p.nombre.toLowerCase().includes(queryA.toLowerCase())
        );

  const filteredB =
    queryB === ""
      ? usuarios
      : usuarios.filter((p) =>
          p.nombre.toLowerCase().includes(queryB.toLowerCase())
        );

  const turnosfilterA = turnos
    .filter((t) => selectedPersonA && t.usuarioId === selectedPersonA.id)
    .map((t) => ({
      ...t,
      fechaFormateada: new Date(t.fecha).toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    }));

  const turnosfilterB = turnos
    .filter((t) => selectedPersonB && t.usuarioId === selectedPersonB.id)
    .map((t) => ({
      ...t,
      fechaFormateada: new Date(t.fecha).toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    }));

  const isFormValid =
    selectedPersonA && selectedPersonB && selectedTurnoA && selectedTurnoB;

  const Submit = async (e) => {
    e.preventDefault();

    if (isFormValid) {
      setLoadingSubmit(true);
      const TurnoCambio = {
        TurnosId: [
          { IdTurno: selectedTurnoA },
          { IdTurno: selectedTurnoB },
        ],
        UsuarioId: [
          { Id: selectedPersonA.id },
          { Id: selectedPersonB.id },
        ],
      };

      try {
        const respuesta = await postData("/api/Turnos/CambioTurnos", TurnoCambio);

        if (!respuesta) {
          showAlert("error", "Error al guardar los datos");
          return;
        }

        showAlert("success", "Datos guardados correctamente ✅");

        setSelectedPersonA(null);
        setSelectedPersonB(null);
        setSelectedTurnoA(null);
        setSelectedTurnoB(null);
        setQueryA("");
        setQueryB("");
        await fetchData();
      } catch (error) {
        console.error("Error al enviar los datos:", error);
        showAlert("error", "Hubo un problema con la conexión o el servidor");
      } finally {
        setLoadingSubmit(false);
      }
    } else {
      showAlert("warning", "Datos incompletos ❌");
    }
  };

  return (
    <div className="relative bg-gradient-to-r from-primary via-[#6A3BAF] to-[#7A5BCF] backdrop-blur supports-[backdrop-filter]:bg-primary/80 md:min-h-auto p-6 md:p-10 rounded-3xl max-w-2xl m-auto shadow-2xl border border-white/10">
      
      {/* Alerta flotante animada */}
      {alertInfo && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl transition-all duration-300 animate-bounce ${
            alertInfo.type === "success"
              ? "bg-emerald-600 border border-emerald-400 text-white"
              : alertInfo.type === "error"
              ? "bg-rose-600 border border-rose-400 text-white"
              : "bg-amber-500 border border-amber-300 text-white"
          }`}
        >
          <span className="font-medium text-sm tracking-wide">{alertInfo.message}</span>
          <button
            type="button"
            onClick={() => setAlertInfo(null)}
            className="ml-2 opacity-70 hover:opacity-100 font-bold transition"
          >
            ✕
          </button>
        </div>
      )}

      {/* Encabezado */}
      <div className="text-center">
        <h1 className="text-white text-xl font-extrabold tracking-wider">
          CAMBIO DE TURNO
        </h1>
        <p className="text-xs md:text-sm text-white/80 mt-1 font-light max-w-sm mx-auto">
          Todos los campos obligatorios para el cambio del turno.
        </p>
      </div>

      {/* Tarjeta de Formulario Glassmorphism */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-black mt-8 shadow-2xl overflow-hidden">
        <form onSubmit={Submit} className="p-6 font-light">
          <div className="grid md:grid-cols-3 items-center gap-6">
            
            {/* --- SECCIÓN PERSONA A --- */}
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wider text-white/70 font-semibold ml-1">
                  Usuario A
                </label>
                <Combobox value={selectedPersonA} onChange={setSelectedPersonA}>
                  <div className="relative">
                    <div className="relative flex items-center">
                      <Combobox.Input
                        className="w-full rounded-2xl py-2.5 pl-9 pr-3 border border-white/30 bg-white/10 text-white placeholder-white/50 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/20 transition text-sm"
                        displayValue={(person) => (person ? person.nombre : "")}
                        onChange={(e) => setQueryA(e.target.value)}
                        placeholder="Escribe un nombre..."
                      />
                      <svg className="w-4 h-4 absolute left-3 text-white/60 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>

                    <Combobox.Options className="absolute z-30 mt-2 max-h-48 w-full overflow-auto rounded-2xl bg-white/95 backdrop-blur-md p-1 shadow-2xl ring-1 ring-black/10 focus:outline-none">
                      {filteredA.length === 0 && queryA !== "" ? (
                        <div className="p-3 text-xs text-gray-500 text-center">
                          No se encontraron usuarios
                        </div>
                      ) : (
                        filteredA.map((person) => (
                          <Combobox.Option
                            key={person.id}
                            value={person}
                            className={({ active }) =>
                              `p-2.5 text-xs md:text-sm rounded-xl cursor-pointer transition flex items-center justify-between ${
                                active ? "bg-primary text-white font-medium" : "text-gray-800 hover:bg-gray-100"
                              }`
                            }
                          >
                            {person.nombre}
                          </Combobox.Option>
                        ))
                      )}
                    </Combobox.Options>
                  </div>
                </Combobox>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wider text-white/70 font-semibold ml-1">
                  Turno A
                </label>
                <div className="relative flex items-center">
                  <select
                    name="Turno A"
                    value={selectedTurnoA || ""}
                    onChange={(e) => setSelectedTurnoA(e.target.value)}
                    className="w-full appearance-none border border-white/30 bg-white/10 text-white rounded-2xl py-2.5 pl-9 pr-8 text-sm focus:outline-none focus:border-white focus:ring-2 focus:ring-white/20 transition cursor-pointer"
                    required
                  >
                    <option value="" disabled hidden className="bg-primary text-white">
                      Selecciona el turno
                    </option>
                    {!selectedPersonA ? (
                      <option disabled className="bg-primary text-white">
                        Selecciona un usuario
                      </option>
                    ) : turnosfilterA.length === 0 ? (
                      <option disabled className="bg-primary text-white">
                        Turno no encontrado
                      </option>
                    ) : (
                      turnosfilterA.map((t) => (
                        <option className="bg-primary text-white" key={t.id} value={t.id}>
                          {t.jornada + " " + t.fechaFormateada.toUpperCase()}
                        </option>
                      ))
                    )}
                  </select>
                  <svg className="w-4 h-4 absolute left-3 text-white/60 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <svg className="w-4 h-4 absolute right-3 text-white/60 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* --- ICONO INTERCAMBIO CENTRAL --- */}
            <div className="flex justify-center my-2 md:my-0">
              <div className="group relative p-3.5 rounded-full bg-white/15 backdrop-blur-md border border-white/30 text-white transition-all duration-300 hover:scale-110 hover:bg-white/25 shadow-lg md:rotate-0 rotate-90">
                <div className="absolute inset-0 rounded-full bg-white/20 blur-md group-hover:blur-lg transition-all" />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 640 640"
                  className="w-7 h-7 text-white relative z-10"
                >
                  <path d="M566.6 214.6L470.6 310.6C458.1 323.1 437.8 323.1 425.3 310.6C412.8 298.1 412.8 277.8 425.3 265.3L466.7 224L96 224C78.3 224 64 209.7 64 192C64 174.3 78.3 160 96 160L466.7 160L425.3 118.6C412.8 106.1 412.8 85.8 425.3 73.3C437.8 60.8 458.1 60.8 470.6 73.3L566.6 169.3C579.1 181.8 579.1 202.1 566.6 214.6zM169.3 566.6L73.3 470.6C60.8 458.1 60.8 437.8 73.3 425.3L169.3 329.3C181.8 316.8 202.1 316.8 214.6 329.3C227.1 341.8 227.1 362.1 214.6 374.6L173.3 416L544 416C561.7 416 576 430.3 576 448C576 465.7 561.7 480 544 480L173.3 480L214.7 521.4C227.2 533.9 227.2 554.2 214.7 566.7C202.2 579.2 181.9 579.2 169.4 566.7z" />
                </svg>
              </div>
            </div>

            {/* --- SECCIÓN PERSONA B --- */}
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wider text-white/70 font-semibold ml-1">
                  Usuario B
                </label>
                <Combobox value={selectedPersonB} onChange={setSelectedPersonB}>
                  <div className="relative">
                    <div className="relative flex items-center">
                      <Combobox.Input
                        className="w-full rounded-2xl py-2.5 pl-9 pr-3 border border-white/30 bg-white/10 text-white placeholder-white/50 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/20 transition text-sm"
                        displayValue={(person) => (person ? person.nombre : "")}
                        onChange={(e) => setQueryB(e.target.value)}
                        placeholder="Escribe un nombre..."
                      />
                      <svg className="w-4 h-4 absolute left-3 text-white/60 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>

                    <Combobox.Options className="absolute z-30 mt-2 max-h-48 w-full overflow-auto rounded-2xl bg-white/95 backdrop-blur-md p-1 shadow-2xl ring-1 ring-black/10 focus:outline-none">
                      {filteredB.length === 0 && queryB !== "" ? (
                        <div className="p-3 text-xs text-gray-500 text-center">
                          No se encontraron usuarios
                        </div>
                      ) : (
                        filteredB.map((person) => (
                          <Combobox.Option
                            key={person.id}
                            value={person}
                            className={({ active }) =>
                              `p-2.5 text-xs md:text-sm rounded-xl cursor-pointer transition flex items-center justify-between ${
                                active ? "bg-primary text-white font-medium" : "text-gray-800 hover:bg-gray-100"
                              }`
                            }
                          >
                            {person.nombre}
                          </Combobox.Option>
                        ))
                      )}
                    </Combobox.Options>
                  </div>
                </Combobox>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wider text-white/70 font-semibold ml-1">
                  Turno B
                </label>
                <div className="relative flex items-center">
                  <select
                    name="Turno B"
                    value={selectedTurnoB || ""}
                    onChange={(e) => setSelectedTurnoB(e.target.value)}
                    className="w-full appearance-none border border-white/30 bg-white/10 text-white rounded-2xl py-2.5 pl-9 pr-8 text-sm focus:outline-none focus:border-white focus:ring-2 focus:ring-white/20 transition cursor-pointer"
                    required
                  >
                    <option value="" disabled hidden className="bg-primary text-white">
                      Selecciona el turno
                    </option>
                    {!selectedPersonB ? (
                      <option disabled className="bg-primary text-white">
                        Selecciona un usuario
                      </option>
                    ) : turnosfilterB.length === 0 ? (
                      <option disabled className="bg-primary text-white">
                        Turno no encontrado
                      </option>
                    ) : (
                      turnosfilterB.map((t) => (
                        <option className="bg-primary text-white" key={t.id} value={t.id}>
                          {t.jornada + " " + t.fechaFormateada.toUpperCase()}
                        </option>
                      ))
                    )}
                  </select>
                  <svg className="w-4 h-4 absolute left-3 text-white/60 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <svg className="w-4 h-4 absolute right-3 text-white/60 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

          </div>

          {/* --- BOTÓN DE ENVIAR --- */}
          <button
            type="submit"
            disabled={!isFormValid || loadingSubmit}
            className={`w-full py-3.5 px-6 mt-8 rounded-2xl font-bold tracking-wide transition-all duration-300 shadow-xl flex items-center justify-center gap-2 ${
              isFormValid && !loadingSubmit
                ? "bg-primary text-white hover:bg-primary/90 active:scale-[0.98] cursor-pointer shadow-primary/30"
                : "bg-secundary-text/50 text-white/60 cursor-not-allowed opacity-75"
            }`}
          >
            {loadingSubmit ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              "Cambiar"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}