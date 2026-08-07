"use client";

import { useState, useEffect, useRef } from "react";
import {
  Calendar as CalendarIcon,
  Info,
  User,
  Clock,
  X,
  Plus,
  Users,
  Building2,
} from "lucide-react";
import { Combobox } from "@headlessui/react";
import DatePickerWithBlocks from "@/components/Calendario";
import useFetchData from "@/components/FetchData";
import { postData } from "@/components/FetchPost";
import AlertModal from "@/components/AlertModal";
import { AlertModalProps, AlertType } from "@/Model/AlertModalProps";
import { CrearTurnoEstudianteDTO } from "@/Model/Turnos/CrearTurnoEstudianteDTO";
import { startOfDay, isSameDay, format } from "date-fns";
import { es } from "date-fns/locale";

type AlertConfig = Omit<AlertModalProps, "isOpen" | "onAccept">;

export default function RegisterShiftPage() {
  // Peticiones de datos
  const { data: usuarios2 } = useFetchData("/api/Usuarios/GetUsuarios");
  const { data: Turnos, fetchData } = useFetchData("/api/Turnos/GetTurnos");
  const { data: UsuariosConsultorio } = useFetchData(
    "/api/UsuarioConsultorios/GetUsuarioConsultorio"
  );

  // Estados de formulario
  const [jornada, setJornada] = useState<string>("");
  const [SelectPerson, setSelectedPerson] = useState<any | null>(null);
  const [query, setQuery] = useState("");
  const [Fecha, setFecha] = useState<any>(null);
  const [CalendarioActual, setCalendarioActual] = useState<any>(null);

  // Estado unificado DTO a enviar
  const [Enviar, setEnviar] = useState<CrearTurnoEstudianteDTO>({
    fecha: null,
    jornada: "",
    usuario_id: 0,
  });

  // Estado para gestión de alertas personalizadas
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState<AlertConfig>(
    {
      title: "",
      message: "",
      buttonText: "Aceptar",
      type: "info",
    }
  );

  const comboNameRef = useRef(
    `combobox-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  );

  // Sincronizar el objeto DTO cuando cambien los campos dependientes
  useEffect(() => {
    if (!Fecha || !SelectPerson?.id || !jornada) return;

    setEnviar({
      fecha: new Date(Fecha),
      jornada: jornada,
      usuario_id: SelectPerson.id,
    });
  }, [Fecha, SelectPerson, jornada]);

  if (!usuarios2 || !Turnos || !UsuariosConsultorio) {
    return (
      <div className="min-h-screen flex items-center justify-center font-sans text-slate-800">
        <p className="font-semibold text-slate-500">Cargando...</p>
      </div>
    );
  }

  // Filtrado de usuarios por rol
  const usuarios = usuarios2.filter((u: any) => u.rolId === 2);

  const filtertedUsers =
    query === ""
      ? usuarios
      : usuarios.filter((u: any) =>
          u.nombre.toLowerCase().includes(query.toLowerCase())
        );

  // Obtener consultorio asignado al usuario seleccionado
  const consultorio = SelectPerson
    ? UsuariosConsultorio.find((uc: any) => uc.usuarioId === SelectPerson.id)
    : null;

  // Filtrar turnos del día seleccionado y calendario actual
  const FiltrarTurno = Fecha
    ? Turnos.filter(
        (t: any) =>
          isSameDay(startOfDay(new Date(t.fecha)), startOfDay(Fecha)) &&
          t.calendarioId === CalendarioActual?.id
      ).map((t: any) => ({
        ...t,
        usu: usuarios.find((u: any) => u.id === t.usuarioId),
      }))
    : [];

  if (FiltrarTurno.length > 0) {
    FiltrarTurno.sort((a: any, b: any) => a.jornada.localeCompare(b.jornada));
  }

  const limpiar = () => {
    setFecha(null);
    setJornada("");
    setSelectedPerson(null);
    setQuery("");
    setEnviar({
      fecha: null,
      jornada: "",
      usuario_id: 0,
    });
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

  // Enviar formulario a la API usando el modelo Enviar
  const Submit = async (e: React.FormEvent) => {
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
      } catch (error: any) {
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
    <div className="min-h-screen flex items-center justify-center font-sans text-slate-800">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        {/* ================= ENCABEZADO PÚRPURA ================= */}
        <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-800 text-white p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 opacity-15 pointer-events-none">
            <CalendarIcon className="w-48 h-48 text-white" />
          </div>

          <div className="flex items-center space-x-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-300/30 flex items-center justify-center text-amber-300 shadow-inner">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">
                Registro de Turno
              </h1>
              <p className="text-xs sm:text-sm text-purple-200 mt-0.5">
                Completa la información para agendar tu turno de consultorio.
              </p>
            </div>
          </div>
        </div>

        {/* ================= CUERPO DEL FORMULARIO ================= */}
        <div className="p-3 sm:p-8 space-y-8">
          {/* 1. SELECCIONAR FECHA */}
          <section className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-7 h-7 rounded-full bg-purple-800 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                1
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-1">
                  Selecciona la fecha del turno{" "}
                  <span className="text-red-500">*</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Elige el día en el que deseas agendar tu turno.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start pl-0 sm:pl-10">
              {/* Widget de Calendario */}
              <div className="w-fit xl:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <DatePickerWithBlocks
                  selected={Fecha}
                  onSelect={setFecha}
                  onLoadCalendario={(cal: any) => setCalendarioActual(cal)}
                />
              </div>

              {/* Panel Lateral de Fecha Seleccionada */}
              <div className="md:col-span-12 xl:col-span-5 bg-purple-50/60 border border-purple-100 rounded-2xl p-5 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 text-purple-800 rounded-xl">
                    <CalendarIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-600">
                      Fecha seleccionada
                    </p>
                    <p className="text-sm font-extrabold text-indigo-950 mt-0.5 capitalize">
                      {Fecha
                        ? format(new Date(Fecha), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })
                        : "Ninguna fecha seleccionada"}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-purple-100/80 flex items-start space-x-2 text-xs text-slate-600">
                  <Info className="w-4 h-4 text-purple-700 flex-shrink-0 mt-0.5" />
                  <span>
                    Los días en gris no tienen disponibilidad de turnos.
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* 2. SELECCIONAR ESTUDIANTE */}
          <section className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-7 h-7 rounded-full bg-purple-800 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                2
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-1">
                  Seleccione el estudiante{" "}
                  <span className="text-red-500">*</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Elige el estudiante que realizará el turno.
                </p>
              </div>
            </div>

            <div className="pl-0 sm:pl-10">
              <Combobox value={SelectPerson} onChange={setSelectedPerson}>
                <div className="relative border border-slate-200 rounded-2xl bg-white p-2 shadow-sm hover:border-slate-300 transition-colors flex items-center">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-800 flex items-center justify-center mr-3 flex-shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <Combobox.Input
                    className="w-full bg-transparent text-sm font-bold text-slate-800 focus:outline-none cursor-pointer pr-8 placeholder:font-normal placeholder:text-slate-400"
                    displayValue={(person: any) => (person ? person.nombre : "")}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Escribe el nombre del estudiante"
                    autoComplete="off"
                    name={comboNameRef.current}
                    spellCheck={false}
                    autoCorrect="off"
                    autoCapitalize="off"
                  />
                  <div className="absolute right-4 pointer-events-none text-slate-500 text-xs">
                    ▼
                  </div>

                  <Combobox.Options className="absolute top-full left-0 mt-2 max-h-48 w-full overflow-auto rounded-2xl bg-white border border-slate-200 shadow-xl z-50 p-1 divide-y divide-slate-50">
                    {filtertedUsers.length === 0 && query !== "" ? (
                      <div className="p-3 text-xs text-slate-500 text-center">
                        No se encontraron estudiantes.
                      </div>
                    ) : (
                      filtertedUsers.map((person: any) => (
                        <Combobox.Option
                          key={person.id}
                          value={person}
                          className={({ active }) =>
                            `p-2.5 text-xs font-semibold rounded-xl cursor-pointer transition-colors ${
                              active
                                ? "bg-purple-50 text-purple-900"
                                : "text-slate-700"
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
          </section>

          {/* TABLA DE TURNOS AGENDADOS */}
          <div className="pl-0 sm:pl-10 pt-2">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-purple-800" />
                  <span className="text-xs font-bold text-slate-800">
                    Turnos agendados {Fecha ? `(${format(new Date(Fecha), "d 'de' MMMM", { locale: es })})` : ""}
                  </span>
                </div>
                <span className="text-[11px] bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full font-bold">
                  {FiltrarTurno.length} asignados
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-indigo-950 text-white text-[11px] font-semibold">
                      <th className="p-2.5 pl-3">Nombre del estudiante</th>
                      <th className="p-2.5">Consultorio</th>
                      <th className="p-2.5 pr-3">Jornada</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {FiltrarTurno.length === 0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="p-4 text-center text-slate-400 font-medium"
                        >
                          No hay turnos registrados para esta fecha.
                        </td>
                      </tr>
                    ) : (
                      FiltrarTurno.map((item: any) => (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="p-2.5 pl-3 font-semibold text-slate-800">
                            {item.usu?.nombre || "Cargando..."}
                          </td>
                          <td className="p-2.5 text-slate-600">
                            <span className="inline-flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-slate-400" />
                              {item.consultorioId}
                            </span>
                          </td>
                          <td className="p-2.5 pr-3 text-slate-600">
                            <span className="inline-flex items-center gap-1 font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                              <Clock className="w-3 h-3 text-purple-700" />
                              {item.jornada}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 3. JORNADA */}
          <section className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-7 h-7 rounded-full bg-purple-800 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                3
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-1">
                  Jornada <span className="text-red-500">*</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Selecciona la jornada en la que deseas agendar tu turno.
                </p>
              </div>
            </div>

            <div className="pl-0 sm:pl-10 space-y-3">
              <div className="relative flex items-center border border-slate-200 rounded-2xl bg-white p-2 shadow-sm hover:border-slate-300 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-800 flex items-center justify-center mr-3 flex-shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <select
                  value={jornada}
                  onChange={(e) => setJornada(e.target.value)}
                  className="w-full bg-transparent text-sm font-bold text-slate-800 focus:outline-none cursor-pointer appearance-none pr-8"
                >
                  <option value="">Selecciona una jornada</option>
                  <option value="AM">AM - 08:00 - 12:00</option>
                  <option value="PM">PM - 14:00 - 18:00</option>
                </select>
                <div className="absolute right-4 pointer-events-none text-slate-500 text-xs">
                  ▼
                </div>
              </div>

              {/* Banner Informativo Horario */}
              <div className="bg-purple-50/60 border border-purple-100 rounded-2xl p-3.5 flex items-center space-x-3 text-xs text-slate-600">
                <Info className="w-4 h-4 text-purple-700 flex-shrink-0" />
                <span>
                  {jornada === "PM"
                    ? "Horario disponible: 02:00 p.m. a 06:00 p.m."
                    : "Horario disponible: 08:00 a.m. a 12:00 p.m."}
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* ================= BOTONES ACCIÓN INFERIORES ================= */}
        <div className="bg-slate-50 border-t border-slate-100 p-4 sm:p-6 flex items-center justify-end space-x-3">
          <button
            onClick={limpiar}
            type="button"
            className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors shadow-sm"
          >
            <X className="w-4 h-4" />
            <span>Cancelar</span>
          </button>

          <button
            onClick={Submit}
            type="button"
            className="flex items-center space-x-1.5 px-6 py-2.5 rounded-xl bg-purple-800 hover:bg-purple-900 text-white font-bold text-xs transition-colors shadow-md shadow-purple-200"
          >
            <Plus className="w-4 h-4" />
            <span>Añadir Turno</span>
          </button>
        </div>
      </div>

      <AlertModal
        isOpen={alertOpen}
        title={alertConfig.title}
        message={alertConfig.message}
        buttonText={alertConfig.buttonText}
        type={alertConfig.type}
        onAccept={handleAlertClose}
      />
    </div>
  );
}