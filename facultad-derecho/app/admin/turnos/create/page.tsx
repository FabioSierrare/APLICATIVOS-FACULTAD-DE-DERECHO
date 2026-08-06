"use client";

import DatePickerWithBlocks from "@/components/Calendario";
import { Combobox } from "@headlessui/react";
import { useEffect, useState, useRef } from "react";
import Jornada from "@/components/Jornada";
import useFetchData from "@/components/FetchData";
import { postData } from "@/components/FetchPost";
import AlertModal from "@/components/AlertModal";
import { AlertType } from "@/Model/AlertModalProps";
import { startOfDay, isSameDay } from "date-fns";
import { CrearTurnoEstudianteDTO } from "@/Model/Turnos/CrearTurnoEstudianteDTO";

export default function prueba() {
  const { data: usuarios2 } = useFetchData("/api/Usuarios/GetUsuarios");
  const { data: Turnos, fetchData } = useFetchData("/api/Turnos/GetTurnos");
  const { data: UsuariosConsultorio } = useFetchData(
    "/api/UsuarioConsultorios/GetUsuarioConsultorio",
  );
  const [jornada, setJornada] = useState("");
  const [SelectPerson, setSelectedPerson] = useState<any>(null);
  const [query, setQuery] = useState("");
  const comboNameRef = useRef(
    `combobox-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  );

  const [Enviar, setEnviar] = useState<CrearTurnoEstudianteDTO>({
    fecha: null,
    jornada: "",
    usuario_id: 0,
  });

  const [Fecha, setFecha] = useState("");
  const [CalendarioActual, setCalendarioActual] = useState(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    title: string;
    message: string;
    buttonText: string;
    type: AlertType;
  }>({
    title: "",
    message: "",
    buttonText: "Aceptar",
    type: "info",
  });
  useEffect(() => {
    if (!Fecha || !SelectPerson?.id || !jornada) return;

    setEnviar({
      fecha: new Date(Fecha),
      jornada: jornada,
      usuario_id: SelectPerson.id,
    });
  }, [Fecha, SelectPerson, jornada]);

  if (!usuarios2 || !Turnos || !UsuariosConsultorio) {
    return <p>Cargando...</p>;
  }

  const usuarios = usuarios2.filter((u) => u.rolId === 2);

  const filtertedUsers =
    query === ""
      ? usuarios
      : usuarios.filter((u) =>
          u.nombre.toLowerCase().includes(query.toLowerCase()),
        );

  const consultorio = SelectPerson
    ? UsuariosConsultorio.find((uc: any) => uc.usuarioId === SelectPerson.id)
    : null;

  const FiltrarTurno = Fecha
    ? Turnos.filter(
        (t) =>
          isSameDay(startOfDay(new Date(t.fecha)), startOfDay(Fecha)) &&
          t.calendarioId === CalendarioActual.id,
      ).map((t) => ({
        ...t,
        usu: usuarios.find((u) => u.id === t.usuarioId),
      }))
    : [];

  if (FiltrarTurno) {
    FiltrarTurno.sort((a, b) => a.jornada.localeCompare(b.jornada));
  }

  const limpiar = () => {
    setFecha(null);
    setJornada("");
    setSelectedPerson(null);
  };

  const handleAlertClose = () => {
    setAlertOpen(false);
    setAlertConfig({
      title: "",
      message: "",
      buttonText: "Aceptar",
      type: "info",
    });
  };

  console.log(Enviar);

  const Submit = async (e) => {
    e.preventDefault();
    if (Fecha && jornada && SelectPerson && consultorio && CalendarioActual) {
      try {
        const respuesta = await postData("/api/Turnos/PostTurnos", Enviar);
        if (!respuesta) {
          throw new Error("Error al guardar el turno");
        }

        setAlertConfig({
          title: "Turno agregado",
          message: respuesta?.message || "El turno se guardó correctamente.",
          buttonText: "Aceptar",
          type: "success",
        });
        setAlertOpen(true);
        limpiar();
        await fetchData();
      } catch (error) {
        setAlertConfig({
          title: "No se pudo guardar",
          message: error?.message || "Ocurrió un error al guardar el turno",
          buttonText: "Entendido",
          type: "error",
        });
        setAlertOpen(true);
      }
    } else {
      setAlertConfig({
        title: "Datos incompletos",
        message: "Todos los campos son obligatorios.",
        buttonText: "Entendido",
        type: "warning",
      });
      setAlertOpen(true);
      return;
    }
  };

  return (
    <div className="bg-linear-to-r from-primary via-[#6A3BAF] to-[#7A5BCF] backdrop-blur supports-backdrop-filter:bg-primary/80 md:min-h-auto p-10 rounded-2xl max-w-3xl m-auto">
      <AlertModal
        isOpen={alertOpen}
        title={alertConfig.title}
        message={alertConfig.message}
        buttonText={alertConfig.buttonText}
        type={alertConfig.type}
        onAccept={handleAlertClose}
      />
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

          <div className="mt-5 overflow-auto">
            <table className="w-full text-sm text-white">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="px-2 py-2 text-left">Nombre</th>
                  <th className="px-2 py-2 text-left">Consultorio</th>
                  <th className="px-2 py-2 text-left">Jornada</th>
                </tr>
              </thead>
              <tbody>
                {FiltrarTurno.map((t) => (
                  <tr key={t.id} className="border-b border-white/10">
                    <td className="px-2 py-2">{t.usu?.nombre}</td>
                    <td className="px-2 py-2">{t.consultorioId}</td>
                    <td className="px-2 py-2">{t.jornada}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
              displayValue={(person: any) => (person ? person.nombre : "")}
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
