"use client";

import DatePickerWithBlocks from "@/components/Calendario";
import { Combobox } from "@headlessui/react";
import { useEffect, useState, useRef } from "react";
import Jornada from "@/components/Jornada";
import useFetchData from "@/components/FetchData";
import { postData } from "@/components/FetchPost";
import { parseISO, startOfDay, isSameDay } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function prueba() {
  const { data: usuarios2 } = useFetchData("/api/Usuarios/GetUsuarios");
  const { data: Turnos, fetchData } = useFetchData("/api/Turnos/GetTurnos");
  const { data: UsuariosConsultorio } = useFetchData(
    "/api/UsuarioConsultorios/GetUsuarioConsultorio"
  );
  const [jornada, setJornada] = useState("");
  const [SelectPerson, setSelectedPerson] = useState("");
  const [query, setQuery] = useState("");
  const comboNameRef = useRef(
    `combobox-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  );
  const [Fecha, setFecha] = useState("");
  const [CalendarioActual, setCalendarioActual] = useState(null);
  if (!usuarios2 || !Turnos || !UsuariosConsultorio) {
    return <p>Cargando...</p>;
  }

  const usuarios = usuarios2.filter((u) => u.rolId === 2);

  const filtertedUsers =
    query === ""
      ? usuarios
      : usuarios.filter((u) =>
          u.nombre.toLowerCase().includes(query.toLowerCase())
        );

  const consultorio = SelectPerson
    ? UsuariosConsultorio.find((uc) => uc.usuarioId === SelectPerson.id)
    : [];

  const FiltrarTurno = Fecha
    ? Turnos.filter((t) =>
        isSameDay(startOfDay(new Date(t.fecha)), startOfDay(Fecha)) && t.calendarioId === CalendarioActual.id
      ).map((t) => ({
        ...t,
        usu: usuarios.find((u) => u.id === t.usuarioId),
      }))
    : [];

    if(FiltrarTurno){
      FiltrarTurno.sort((a, b) => a.jornada.localeCompare(b.jornada));
    }

    const limpiar = () => {
      setFecha(null)
      setJornada("")
      setSelectedPerson(null)
    }
  const Submit = async (e) => {
    e.preventDefault();
    if (Fecha && jornada && SelectPerson && consultorio && CalendarioActual) {
      const AñadirTurno = {
        UsuarioId: SelectPerson.id,
        ConsultorioId: consultorio.consultorioId,
        CalendarioId: CalendarioActual.id,
        Fecha: new Date(Fecha),
        Jornada: jornada,
      };

      try{
        const respuesta = await postData("/api/Turnos/PostTurnos", AñadirTurno)
        if (!respuesta) {
        throw new Error("Error al guardar el turno");
      }

      alert("Turno guardado con éxito");
      limpiar()
      await fetchData();
      } catch(error){
        alert("Ocurrió un error al guardar el turno");
      }
    }else {
      alert("⚠️ Todos los campos son obligatorios");
      return;
    }
  };

  return (
    <div className="bg-gradient-to-r from-primary via-[#6A3BAF] to-[#7A5BCF] backdrop-blur supports-[backdrop-filter]:bg-primary/80 md:min-h-auto p-10 rounded-2xl max-w-3xl m-auto">
      <h1 className="text-white font-semibold text-xl mb-5 text-center">
        REGISTRO DE TURNO
      </h1>
      <div className=" flex md:justify-between flex-col mb-7">
        <h3 className="text-white font-semibold text-md mb-5">
          SELECCIÓNE LA FECHA DEL TURNO <span className="text-red-600">*</span>
        </h3>
        <div>
          <DatePickerWithBlocks
            selected={Fecha}
            onSelect={setFecha}
            className="mx-auto"
            onLoadCalendario={(cal) => setCalendarioActual(cal)}
          />

          <Table className="text-white mt-5">
            <TableHeader>
              <TableRow>
                <TableHead className="text-white">Nombre</TableHead>
                <TableHead className="text-white">Consultorio</TableHead>
                <TableHead className="text-white">Jornada</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {FiltrarTurno.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>{t.usu?.nombre}</TableCell>
                  <TableCell>{t.consultorioId}</TableCell>
                  <TableCell>{t.jornada}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="mb-10">
        <h3 className="text-white font-semibold text-md mb-5">
          SELECCIONE EL ESTUDIANTE <span className="text-red-600">*</span>
        </h3>
        <Combobox value={SelectPerson} onChange={setSelectedPerson}>
          <div className="relative">
            <Combobox.Input
              className="w-full rounded-2xl p-2 border text-white"
              displayValue={(person) => (person ? person.nombre : "")}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Escribe el nombre del estudiante"
              autoComplete="off"
              name={comboNameRef.current}
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="off"
            />

            <Combobox.Options className="absolute mt-1 max-h-40 w-full overflow-auto rounded-xl bg-white shadow-lg">
              {filtertedUsers.map((person) => (
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
      </div>
      <Jornada
        jornada={jornada}
        set={setJornada}
        parametroText="text-white mb-4"
      />
      <button
        className={`w-full flex justify-center
              ${
                Fecha && SelectPerson && jornada && CalendarioActual
                  ? "bg-primary text-white p-3 col-span-full mt-7 rounded-3xl hover:bg-primary/90 cursor-pointer"
                  : "bg-secundary-text text-white p-3 col-span-full mt-7 rounded-3xl cursor-not-allowed"
              }
              `}
        onClick={Submit}
      >
        Añadir
      </button>
    </div>
  );
}
