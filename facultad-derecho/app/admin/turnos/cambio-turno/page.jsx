"use client";

import useFetchData from "@/components/FetchData";
import { useState, useEffect } from "react";
import { Combobox } from "@headlessui/react";
import { postData } from "@/components/FetchPost";
import { useRouter } from "next/navigation";

export default function prueba() {
  const { data: usuarios2 } = useFetchData("/api/Usuarios/GetUsuarios");
  const { data: turnos, fetchData } = useFetchData("/api/Turnos/GetTurnos");
  const [selectedPersonA, setSelectedPersonA] = useState(null);
  const [selectedPersonB, setSelectedPersonB] = useState(null);
  const [selectedTurnoA, setSelectedTurnoA] = useState(null);
  const [selectedTurnoB, setSelectedTurnoB] = useState(null);
  const [queryA, setQueryA] = useState("");
  const [queryB, setQueryB] = useState("");


  if (!usuarios2 || !turnos) {
    return <p>Cargando...</p>;
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

  const Submit = async (e) => {
    e.preventDefault();
  // Verifica que todo esté seleccionado
  if (selectedPersonA && selectedPersonB && selectedTurnoA && selectedTurnoB) {
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
      console.log("Respuesta del servidor:", respuesta);

      if (!respuesta) {
        alert("Error al guardar los datos");
        return;
      }

      alert("Datos guardados correctamente ✅");

      // Reinicia los campos si deseas
      setSelectedPersonA(null);
      setSelectedPersonB(null);
      setSelectedTurnoA(null);
      setSelectedTurnoB(null);
      setQueryA("");
      setQueryB("");
      await fetchData();
    } catch (error) {
      console.error("Error al enviar los datos:", error);
      alert("Hubo un problema con la conexión o el servidor");
    }
  } else {
    alert("Datos incompletos ❌");
  }
};


  return (
    <div className="bg-gradient-to-r from-primary via-[#6A3BAF] to-[#7A5BCF] backdrop-blur supports-[backdrop-filter]:bg-primary/80 md:min-h-auto p-10 rounded-2xl max-w-2xl m-auto">
      <h1 className="text-white text-[18px] font-bold text-center">
        CAMBIO DE TURNO
      </h1>
      <div className="bg-white/10 m-auto rounded-2xl text-black mt-10">
        <form
          action=""
          className="grid md:grid-cols-3 m-auto gap-5 p-5 font-light"
        >
          <div className="grid grid-cols-1 gap-5 md:gap-20">
            <Combobox value={selectedPersonA} onChange={setSelectedPersonA}>
              <div className="relative">
                <Combobox.Input
                  className="w-full rounded-2xl p-2 border text-white"
                  displayValue={(person) => (person ? person.nombre : "")}
                  onChange={(e) => setQueryA(e.target.value)}
                  placeholder="Escribe un nombre..."
                />
                <Combobox.Options className="absolute mt-1 max-h-40 w-full overflow-auto rounded-xl bg-white shadow-lg">
                  {filteredA.map((person) => (
                    <Combobox.Option
                      key={person.id}
                      value={person}
                      className="p-2 cursor-pointer hover:bg-gray-100"
                    >
                      {person.nombre}
                    </Combobox.Option>
                  ))}
                </Combobox.Options>
              </div>
            </Combobox>
            <select
              name="Turno A"
              id=""
              value={selectedTurnoA || ""}
              onChange={(e) => setSelectedTurnoA(e.target.value)}
              className="border text-white rounded-2xl p-2 mb-1"
              required
            >
              <option value="" disabled hidden className="bg-primary text-white">Selecciona el turno</option>
              {!selectedPersonA ? (
                <option disabled>Selecciona un usuario</option>
              ) : turnosfilterA.length === 0 ? (
                <option disabled>Turno no encontrado</option>
              ) : (
                
                turnosfilterA.map((t) => (
                  <option className="bg-primary" key={t.id} value={t.id}>
                    {t.jornada+" "+ t.fechaFormateada.toUpperCase()}
                  </option>
                ))
              )}
            </select>
          </div>
          <div className="flex justify-center md:rotate-0 rotate-90">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 640 640"
              className="text-white w-18 text-center flex justify-center mx-auto"
            >
              <path d="M566.6 214.6L470.6 310.6C458.1 323.1 437.8 323.1 425.3 310.6C412.8 298.1 412.8 277.8 425.3 265.3L466.7 224L96 224C78.3 224 64 209.7 64 192C64 174.3 78.3 160 96 160L466.7 160L425.3 118.6C412.8 106.1 412.8 85.8 425.3 73.3C437.8 60.8 458.1 60.8 470.6 73.3L566.6 169.3C579.1 181.8 579.1 202.1 566.6 214.6zM169.3 566.6L73.3 470.6C60.8 458.1 60.8 437.8 73.3 425.3L169.3 329.3C181.8 316.8 202.1 316.8 214.6 329.3C227.1 341.8 227.1 362.1 214.6 374.6L173.3 416L544 416C561.7 416 576 430.3 576 448C576 465.7 561.7 480 544 480L173.3 480L214.7 521.4C227.2 533.9 227.2 554.2 214.7 566.7C202.2 579.2 181.9 579.2 169.4 566.7z" />
            </svg>
          </div>
          <div className="grid grid-cols-1 gap-5 md:gap-20">
            <Combobox value={selectedPersonB} onChange={setSelectedPersonB}>
              <div className="relative">
                <Combobox.Input
                  className="w-full rounded-2xl p-2 border text-white"
                  displayValue={(person) => (person ? person.nombre : "")}
                  onChange={(e) => setQueryB(e.target.value)}
                  placeholder="Escribe un nombre..."
                />
                <Combobox.Options className="absolute mt-1 max-h-40 w-full overflow-auto rounded-xl bg-white shadow-lg">
                  {filteredB.map((person) => (
                    <Combobox.Option
                      key={person.id}
                      value={person}
                      className="p-2 cursor-pointer hover:bg-gray-100"
                    >
                      {person.nombre}
                    </Combobox.Option>
                  ))}
                </Combobox.Options>
              </div>
            </Combobox>
            <select
              name="Turno B"
              id=""
              className="border text-white rounded-2xl p-2 mb-1"
              value={selectedTurnoB || ""}
              onChange={(e) => setSelectedTurnoB(e.target.value)}
              required
            >
              <option value="" disabled hidden className="bg-primary text-white">Selecciona el turno</option>
              {!selectedPersonB ? (
                <option disabled>Selecciona un usuario</option>
              ) : turnosfilterB.length === 0 ? (

                <option disabled>Turno no encontrado</option>
              ) : (
                turnosfilterB.map((t) => (
                  <option className="bg-primary" key={t.id} value={t.id}>
                    {t.jornada+" "+ t.fechaFormateada.toUpperCase()}
                  </option>
                ))
              )}
            </select>
          </div>
          
          
          <button
            className={`
              ${
                selectedPersonA && selectedPersonB && selectedTurnoA && selectedTurnoB ? "bg-primary text-white p-3 col-span-full mt-7 rounded-3xl hover:bg-primary/90 cursor-pointer" : "bg-secundary-text text-white p-3 col-span-full mt-7 rounded-3xl cursor-not-allowed"
              }
              `}
            onClick={Submit}
          >Cambiar</button>
        </form>
      </div>
    </div>
  );
}
