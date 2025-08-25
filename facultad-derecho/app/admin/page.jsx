  "use client";
  import React, { useEffect, useMemo, useState } from "react";
  import { useRouter } from "next/navigation";
  import useFetchData from "@/components/FetchData";
  import { postData } from "@/components/FetchPost";

  // --- Optional shared UI libs (available in this environment) ---
  import { Button } from "@/components/ui/button";
  import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  import { Input } from "@/components/ui/input";
  import { Label } from "@/components/ui/label";
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
  import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
  import { Badge } from "@/components/ui/badge";
  import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
  import { Progress } from "@/components/ui/progress";
  import {
    CalendarDays,
    Building2,
    Gavel,
    AlarmClock,
    CheckCircle2,
    AlertTriangle,
    ChevronRight,
    Info,
  } from "lucide-react";

  // --- Project helpers (replace with your real hooks/services) ---
  // If you already have these in your project, keep your originals and remove the mocks.
  // import useFetchData from "@/components/FetchData";
  // import { postData } from "@/components/FetchPost";

  // Mocked service (delete if you have real endpoints)

  export default function CalendarioAbogadasUI() {
    // ======= STATE =======
    const router = useRouter();
    const [rangoEvento, setRangoEvento] = useState({ inicio: "", fin: "" });
    const [diaConciliacion, setDiaConciliacion] = useState("");
    const [semestre, setSemestre] = useState("");
    const [festivosFiltrados, setFestivosFiltrados] = useState([]);
    const [totalFestivos, setTotalFestivos] = useState(0);
    const [errorMensaje, setErrorMensaje] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const [FormularioCalendarios, setFormularioCalendario] = useState({
      Calendarios: {},
      LimitesTurnosConsultorio: [{ ConsultorioId: 0, LimiteTurnos: 0 }],
      ConfiguracionDias: [],
    });

    const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
    const semestreOptions = [
      { value: "S1", label: "Primer Semestre" },
      { value: "S2", label: "Segundo Semestre" },
    ];

    const [configDias, setConfigDias] = useState(
      diasSemana.map((d) => ({ dia: d, maxTurnosAM: 0, maxTurnosPM: 0 }))
    );

    // ======= FETCH CONSULTORIOS =======
    const { data: consultorio, loading: loadingConsultorios } = useFetchData(
      "/api/Consultorios/GetConsultorios"
    );
    const [consultorios, setConsultorios] = useState([]);
    console.log(consultorio);

    useEffect(() => {
      if (Array.isArray(consultorio)) {
        const consultoriosFormateados = consultorio.map((c) => ({
          id: c.id,
          nombre: c.nombre,
          turnos: 3,
        }));

        setConsultorios(consultoriosFormateados);
      }
    }, [consultorio]);

    useEffect(() => {
      setFormularioCalendario((prev) => ({
        ...prev,
        LimitesTurnosConsultorio: consultorios.map((c) => ({
          CalendarioId: 0,
          ConsultorioId: c.id,
          LimiteTurnos: c.turnos,
        })),
      }));
    }, [consultorios]);

    // ======= LINK CALENDARIOS to form =======
    useEffect(() => {
      const inicio = rangoEvento.inicio ? new Date(rangoEvento.inicio) : null;
      const fin = rangoEvento.fin ? new Date(rangoEvento.fin) : null;

      setFormularioCalendario((prev) => ({
        ...prev,
        Calendarios: {
          ...prev.Calendarios,
          Anio: inicio?.getFullYear?.() || null,
          Semestre: semestre || null,
          FechaInicio: inicio || null,
          FechaFin: fin || null,
          DiaConciliacion: diaConciliacion || null,
          Estado: "Activo",
        },
      }));
    }, [rangoEvento, diaConciliacion, semestre]);

    // ======= CONFIG DIAS -> form =======
    useEffect(() => {
      setFormularioCalendario((prev) => ({
        ...prev,
        ConfiguracionDias: configDias.map((d) => ({
          DiaSemana: d.dia,
          CalendarioId: 0,
          MaxTurnosAM: d.maxTurnosAM,
          MaxTurnosPM: d.maxTurnosPM,
        })),
      }));
    }, [configDias]);

    // ======= HANDLERS =======
    const handleRangoChange = (e) => {
      const { name, value } = e.target;
      setRangoEvento((prev) => ({ ...prev, [name]: value }));
    };

    const handleConfigDiaChange = (diaSeleccionado, campo, valor) => {
      setConfigDias((prev) =>
        prev.map((dia) =>
          dia.dia === diaSeleccionado
            ? {
                ...dia,
                [campo]: Number.isFinite(parseInt(valor)) ? parseInt(valor) : 0,
              }
            : dia
        )
      );
    };

    const handleConsultorioChange = (id, field, value) => {
      setConsultorios((prev) =>
        prev.map((cons) => (cons.id === id ? { ...cons, [field]: value } : cons))
      );
    };

    // ======= VALIDATIONS & CALCS =======
    const validarFormulario = () => {
      const { Calendarios, LimitesTurnosConsultorio, ConfiguracionDias } =
        FormularioCalendarios;

      if (
        !Calendarios?.Anio ||
        !Calendarios?.Semestre ||
        !Calendarios?.FechaInicio ||
        !Calendarios?.FechaFin ||
        !Calendarios?.DiaConciliacion
      ) {
        setErrorMensaje("Por favor, completa todos los campos del calendario.");
        return false;
      }

      if (Calendarios.FechaFin < Calendarios.FechaInicio) {
        setErrorMensaje(
          "La fecha de fin debe ser igual o posterior a la fecha de inicio."
        );
        return false;
      }

      for (const c of LimitesTurnosConsultorio) {
        if (!c.ConsultorioId || c.LimiteTurnos <= 0) {
          setErrorMensaje(
            "Cada consultorio debe tener un límite de turnos mayor a 0."
          );
          return false;
        }
      }

      for (const d of ConfiguracionDias) {
        const esConciliacion = d.DiaSemana === diaConciliacion;

        if (
          !d.DiaSemana ||
          d.MaxTurnosAM < 0 ||
          d.MaxTurnosPM < 0 ||
          (!esConciliacion && !d.MaxTurnosAM && !d.MaxTurnosPM) // 👈 solo exigir en los demás días
        ) {
          setErrorMensaje(
            "Cada día debe tener un nombre y al menos 1 turno total en AM o PM (excepto el día de conciliación)."
          );
          return false;
        }
      }

      setErrorMensaje("");
      return true;
    };

    const isFormularioValido = useMemo(() => {
      const { Calendarios, LimitesTurnosConsultorio, ConfiguracionDias } =
        FormularioCalendarios;
      const inicioValido =
        Calendarios?.FechaInicio instanceof Date &&
        !isNaN(Calendarios?.FechaInicio);
      const finValido =
        Calendarios?.FechaFin instanceof Date && !isNaN(Calendarios?.FechaFin);
      const basicos =
        Boolean(Calendarios?.Anio) &&
        Boolean(Calendarios?.Semestre) &&
        inicioValido &&
        finValido &&
        Boolean(Calendarios?.DiaConciliacion);
      const consultoriosOk =
        Array.isArray(LimitesTurnosConsultorio) &&
        LimitesTurnosConsultorio.every((c) => c.LimiteTurnos > 0);
      const diasOk =
        Array.isArray(ConfiguracionDias) &&
        ConfiguracionDias.every(
          (d) => d.DiaSemana && d.MaxTurnosAM >= 0 && d.MaxTurnosPM >= 0
        );
      return basicos && consultoriosOk && diasOk;
    }, [FormularioCalendarios]);

    // Weeks and totals
    const diasConfigurables = configDias.filter((d) => d.dia !== diaConciliacion);
    const totalTurnosSemana = diasConfigurables.reduce(
      (total, dia) => total + (dia.maxTurnosAM || 0) + (dia.maxTurnosPM || 0),
      0
    );

    const [totalSemanas, setTotalSemanas] = useState(0);
    useEffect(() => {
      if (rangoEvento.inicio && rangoEvento.fin) {
        const inicio = new Date(rangoEvento.inicio);
        const fin = new Date(rangoEvento.fin);
        if (fin >= inicio) {
          const diffDias = Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24)) + 1;
          const semanas = Math.ceil(diffDias / 7);
          setTotalSemanas(semanas);
        } else {
          setTotalSemanas(0);
        }
      } else {
        setTotalSemanas(0);
      }
    }, [rangoEvento.inicio, rangoEvento.fin]);

    const totalTurnosReales = Math.max(
      0,
      totalSemanas * totalTurnosSemana - totalFestivos - totalSemanas
    );

    // ======= FERIADOS =======
    useEffect(() => {
      const obtenerFestivos = async () => {
        if (!rangoEvento.inicio || !rangoEvento.fin) return;
        const inicio = new Date(rangoEvento.inicio);
        const fin = new Date(rangoEvento.fin);

        const resp = await fetch(
          `https://date.nager.at/api/v3/PublicHolidays/${inicio.getFullYear()}/CO`
        );
        const festivos = await resp.json();

        const idxConciliacion = diasSemana.indexOf(diaConciliacion);
        const filtrados = festivos.filter((f) => {
          const fDate = new Date(f.date);
          return (
            fDate >= inicio &&
            fDate <= fin &&
            (idxConciliacion === -1 || fDate.getDay() !== idxConciliacion + 1)
          );
        });
        setFestivosFiltrados(filtrados);
        setTotalFestivos(filtrados.length);
      };
      obtenerFestivos();
    }, [rangoEvento.inicio, rangoEvento.fin, diaConciliacion]);

    // ======= SUBMIT =======
    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!validarFormulario()) return;
      try {
        setSubmitting(true);
        const respuesta = await postData(
          "/api/Calendarios/PostTodoForm",
          FormularioCalendarios
        );
        if (!respuesta) {
          setErrorMensaje(respuesta?.message || "Error al guardar los datos");
          setSubmitting(false);
          return;
        }
        setSubmitting(false);
        // Success UI feedback is below; in your app you can redirect:
        // router.push("/admin/calendarios-creados");
        alert("Calendario guardado correctamente");
      } catch (err) {
        setSubmitting(false);
        setErrorMensaje(err?.message || "Error inesperado");
      }
    };

    // ======= PROGRESS for basic completion =======
    const progreso = useMemo(() => {
      let puntos = 0;
      if (semestre) puntos += 25;
      if (rangoEvento.inicio && rangoEvento.fin) puntos += 25;
      if (diaConciliacion) puntos += 25;
      if (totalTurnosSemana > 0) puntos += 25;
      return puntos;
    }, [semestre, rangoEvento, diaConciliacion, totalTurnosSemana]);

    // ======= UI =======
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 to-white">
        {/* Top Bar */}
        

        <main className="mx-auto max-w-full px-4 py-8 grid gap-6 lg:grid-cols-3">
          {/* Left Column: Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" /> Configuración del
                  calendario
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  {/* Semestre */}
                  <div className="col-span-3 md:col-span-1">
                    <Label>Semestre</Label>
                    <Select value={semestre} onValueChange={setSemestre}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Seleccione semestre" />
                      </SelectTrigger>
                      <SelectContent>
                        {semestreOptions.map((op) => (
                          <SelectItem key={op.value} value={op.value}>
                            {op.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Inicio */}
                  <div>
                    <Label>Fecha de inicio</Label>
                    <Input
                      type="date"
                      name="inicio"
                      value={rangoEvento.inicio}
                      onChange={handleRangoChange}
                      className="mt-1"
                    />
                  </div>
                  {/* Fin */}
                  <div>
                    <Label>Fecha de fin</Label>
                    <Input
                      type="date"
                      name="fin"
                      value={rangoEvento.fin}
                      onChange={handleRangoChange}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {/* Día de conciliación */}
                  <div>
                    <Label>Día de conciliación</Label>
                    <Select
                      value={diaConciliacion}
                      onValueChange={setDiaConciliacion}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Seleccione un día laboral" />
                      </SelectTrigger>
                      <SelectContent>
                        {diasSemana.map((d) => (
                          <SelectItem key={d} value={d}>
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Progreso de configuración */}
                  <div className="flex flex-col justify-end">
                    <div className="flex items-center justify-between mb-1">
                      <Label className="text-slate-700">Progreso</Label>
                      <span className="text-sm text-primary">{progreso}%</span>
                    </div>
                    <Progress value={progreso} />
                  </div>
                </div>

                <Tabs defaultValue="dias">
                  <TabsList className="grid grid-cols-2 w-full">
                    <TabsTrigger value="dias">Días laborales</TabsTrigger>
                    <TabsTrigger value="consultorios">Consultorios</TabsTrigger>
                  </TabsList>
                  {/* DÍAS */}
                  <TabsContent value="dias" className="space-y-4">
                    <Alert className="bg-amber-50 border-amber-200">
                      <Info className="h-4 w-4" />
                      <AlertTitle>Configura los turnos por día</AlertTitle>
                      <AlertDescription>
                        Los turnos del día de conciliación (
                        <b>{diaConciliacion || "no seleccionado"}</b>) no se
                        contabilizan para la atención.
                      </AlertDescription>
                    </Alert>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {configDias
                        .filter((d) => d.dia !== diaConciliacion)
                        .map((dia) => (
                          <Card
                            key={dia.dia}
                            className="shadow-none border-dashed"
                          >
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base font-semibold tracking-tight">
                                {dia.dia}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div>
                                <Label>Turnos AM</Label>
                                <Input
                                  type="number"
                                  min={0}
                                  max={20}
                                  value={dia.maxTurnosAM}
                                  onChange={(e) =>
                                    handleConfigDiaChange(
                                      dia.dia,
                                      "maxTurnosAM",
                                      e.target.value
                                    )
                                  }
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label>Turnos PM</Label>
                                <Input
                                  type="number"
                                  min={0}
                                  max={20}
                                  value={dia.maxTurnosPM}
                                  onChange={(e) =>
                                    handleConfigDiaChange(
                                      dia.dia,
                                      "maxTurnosPM",
                                      e.target.value
                                    )
                                  }
                                  className="mt-1"
                                />
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </TabsContent>

                  {/* CONSULTORIOS */}
                  <TabsContent value="consultorios" className="space-y-3">
                    {loadingConsultorios ? (
                      <p className="text-sm text-slate-500">
                        Cargando consultorios…
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {consultorios.map((c) => (
                          <div
                            key={c.id}
                            className="grid gap-3 md:grid-cols-[1fr,auto] items-center rounded-2xl border p-3"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 grid place-items-center rounded-xl bg-slate-100">
                                <Building2 className="h-5 w-5 text-slate-600" />
                              </div>
                              <Input readOnly value={c.nombre} />
                            </div>
                            <div className="flex items-center gap-2 justify-end">
                              <Label className="text-sm">Turnos</Label>
                              <Input
                                type="number"
                                min={1}
                                max={20}
                                value={c.turnos}
                                onChange={(e) =>
                                  handleConsultorioChange(
                                    c.id,
                                    "turnos",
                                    parseInt(e.target.value) || 1
                                  )
                                }
                                className="w-24"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>

                {errorMensaje && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{errorMensaje}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="rounded-xl"
                >
                  Limpiar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!isFormularioValido || submitting}
                  className="rounded-xl"
                >
                  {submitting ? "Guardando…" : "Generar calendario"}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Right Column: Summary */}
          <div className="space-y-6">
            <Card className="shadow-sm w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlarmClock className="h-5 w-5" /> Resumen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border p-3">
                    <p className="text-xs text-slate-500">Semanas</p>
                    <p className="text-2xl font-semibold">{totalSemanas}</p>
                  </div>
                  <div className="rounded-xl border p-3">
                    <p className="text-xs text-slate-500">Festivos</p>
                    <p className="text-2xl font-semibold">{totalFestivos}</p>
                  </div>
                  <div className="rounded-xl border p-3">
                    <p className="text-xs text-slate-500">Turnos/semana</p>
                    <p className="text-2xl font-semibold">{totalTurnosSemana}</p>
                  </div>
                  <div className="rounded-xl border p-3">
                    <p className="text-xs text-slate-500">Turnos totales</p>
                    <p className="text-2xl font-semibold">{totalTurnosReales}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-slate-500">Rango seleccionado</p>
                  <p className="font-medium tracking-tight">
                    {rangoEvento.inicio || "—"}{" "}
                    <span className="text-slate-400">→</span>{" "}
                    {rangoEvento.fin || "—"}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-slate-500">Día de conciliación</p>
                  <p className="font-medium tracking-tight">
                    {diaConciliacion || "—"}
                  </p>
                </div>

                <div className="pt-2">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    {isFormularioValido ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        Listo para generar
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        Completa los campos requeridos
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

        <footer className="border-t bg-white/80">
          <div className="mx-auto max-w-7xl px-4 py-4 text-sm text-slate-500 flex items-center justify-between">
            <span>© {new Date().getFullYear()} Estudio de Abogadas</span>
            <span>Calendarios & Gestión de turnos</span>
          </div>
        </footer>
      </div>
    );
  }
