"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Building2,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Info,
  RotateCcw,
  AlarmClock,
} from "lucide-react";

// --- UI COMPONENTS (Shadcn/ui & Estilos Originales) ---
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { PutData } from "./FetchPut";
// --- Hooks Mockeados ---
import useFetchData from "@/components/FetchData";
// import { postData } from "@/components/FetchPost";

export default function EditarCalendarioForId({ id }) {
  const router = useRouter();

  const { data: infocalendario } = useFetchData(
    `/api/Calendarios/CalendarioCompleto/${id}`,
  );

  const { data: consultorio, loading: loadingConsultorios } = useFetchData(
    "/api/Consultorios/GetConsultorios",
  );

  // --- ESTADOS ---
  const [festivosData, setFestivosData] = useState([]); // Almacena los festivos traídos de la API
  const [rangoEvento, setRangoEvento] = useState({ inicio: "", fin: "" });

  // 1. Configuración Principal
  const [mainConfig, setMainConfig] = useState({
    Semestre: "",
    FechaInicio: "",
    FechaFin: "",
    DiaConciliacion: "",
    Anio: "",
    Estado: "",
    Id: null,
  });

  const [configDias, setConfigDias] = useState([]);
  const [LimitesTurnos, setLimitesTurnos] = useState([]);

  // Estados de UI
  const [errorMensaje, setErrorMensaje] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Constantes
  const diasSemana = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "N/A",
  ];
  const semestreOptions = [
    { value: "S1", label: "Primer" },
    { value: "S2", label: "Segundo" },
  ];

  // --- FUNCIÓN AUXILIAR PARA FECHAS ---
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
  };

  // ==========================================
  // 2. CARGA INICIAL DE DATOS
  // ==========================================
  useEffect(() => {
    if (infocalendario) {
      setMainConfig({
        Anio: infocalendario.calendarios.anio,
        DiaConciliacion: infocalendario.calendarios.diaConciliacion
          ? String(infocalendario.calendarios.diaConciliacion)
          : "",
        FechaInicio: formatDateForInput(infocalendario.calendarios.fechaInicio),
        FechaFin: formatDateForInput(infocalendario.calendarios.fechaFin),
        Estado: infocalendario.calendarios.estado,
        Id: infocalendario.calendarios.id,
        Semestre: infocalendario.calendarios.semestre || "",
      });

      // Mapeamos asegurando que sean números para poder sumar
      setConfigDias(
        infocalendario.configuracionDias.map((c) => ({
          Id: c.id,
          DiaSemana: c.diaSemana,
          MaxTurnosAM: Number(c.maxTurnosAM) || 0,
          MaxTurnosPM: Number(c.maxTurnosPM) || 0,
          CalendarioId: c.calendarioId,
        })),
      );

      setLimitesTurnos(
        infocalendario.limitesTurnosConsultorio.map((lt) => ({
          CalendarioId: lt.calendarioId,
          ConsultorioId: lt.consultorioId,
          LimiteTurnos: Number(lt.limiteTurnos) || 0,
        })),
      );
    }
  }, [infocalendario]);

  // ==========================================
  // 3. LOGICA DE FESTIVOS (API)
  // ==========================================
  useEffect(() => {
    const fetchFestivos = async () => {
      if (!mainConfig.FechaInicio) return;
      const anio = new Date(mainConfig.FechaInicio).getFullYear();
      if (isNaN(anio)) return;

      try {
        const resp = await fetch(
          `https://date.nager.at/api/v3/PublicHolidays/${anio}/CO`,
        );
        if (resp.ok) {
          const data = await resp.json();
          setFestivosData(data);
        }
      } catch (error) {
        console.error("Error cargando festivos", error);
      }
    };
    fetchFestivos();
  }, [mainConfig.FechaInicio]);

  // ==========================================
  // 4. HANDLERS (Faltaban en tu código)
  // ==========================================
  const handleMainConfigChange = (field, value) => {
    setMainConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleConfigDiaChange = (diaSemana, field, value) => {
    const numValue = value === "" ? 0 : parseInt(value, 10);
    setConfigDias((prev) =>
      prev.map((d) =>
        d.DiaSemana === diaSemana
          ? { ...d, [field]: isNaN(numValue) ? 0 : numValue }
          : d,
      ),
    );
  };

  const handleConsultorioChange = (consultorioId, value) => {
    const numValue = parseInt(value, 10) || 0;

    setLimitesTurnos((prev) => {
      // Verificamos si ya existe configuración para este consultorio
      const existe = prev.some((lt) => lt.ConsultorioId === consultorioId);

      if (existe) {
        return prev.map((lt) =>
          lt.ConsultorioId === consultorioId
            ? { ...lt, LimiteTurnos: numValue }
            : lt,
        );
      } else {
        // Si no existe, lo agregamos
        return [
          ...prev,
          {
            CalendarioId: mainConfig.Id,
            ConsultorioId: consultorioId,
            LimiteTurnos: numValue,
          },
        ];
      }
    });
  };

  // ==========================================
  // 5. CÁLCULOS REALES (MOTOR LÓGICO)
  // ==========================================
  const calculos = useMemo(() => {
    // Valores por defecto
    const resultado = {
      semanas: 0,
      festivosEfectivos: 0,
      turnosPromedioSemana: 0,
      totalTurnosReales: 0,
    };

    if (!mainConfig.FechaInicio || !mainConfig.FechaFin) return resultado;

    const fechaInicio = new Date(mainConfig.FechaInicio);
    const fechaFin = new Date(mainConfig.FechaFin);

    // Ajuste de zona horaria para evitar errores de día
    fechaInicio.setMinutes(
      fechaInicio.getMinutes() + fechaInicio.getTimezoneOffset(),
    );
    fechaFin.setMinutes(fechaFin.getMinutes() + fechaFin.getTimezoneOffset());

    if (fechaFin < fechaInicio) return resultado;

    // A. Calcular Semanas (Aprox)
    const diffTime = Math.abs(fechaFin - fechaInicio);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    resultado.semanas = Math.ceil(diffDays / 7);

    // B. Calcular Turnos por Semana (Promedio teórico)
    const diasConfigurables = configDias.filter(
      (d) =>
        d.DiaSemana !== mainConfig.DiaConciliacion && d.DiaSemana !== "N/A",
    );
    resultado.turnosPromedioSemana = diasConfigurables.reduce(
      (total, dia) => total + (dia.MaxTurnosAM || 0) + (dia.MaxTurnosPM || 0),
      0,
    );

    // C. ITERACIÓN DÍA A DÍA (La forma exacta de calcular)
    let contadorTurnos = 0;
    let contadorFestivos = 0;

    // Array auxiliar para convertir getDay() de JS (0=Domingo) a tus strings
    const mapDias = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ];

    let loopDate = new Date(fechaInicio);

    while (loopDate <= fechaFin) {
      const diaSemanaStr = mapDias[loopDate.getDay()];

      // Verificamos si es el día de conciliación (Si lo es, no cuenta nada)
      if (diaSemanaStr !== mainConfig.DiaConciliacion) {
        // Verificamos si es Festivo
        // Buscamos en festivosData si la fecha actual coincide
        const esFestivo = festivosData.some((f) => {
          // Comparación simple de strings YYYY-MM-DD
          return f.date === loopDate.toISOString().split("T")[0];
        });

        if (esFestivo) {
          // Si es festivo en un día laboral (que no es conciliación), lo contamos
          // Solo si ese día tiene configuración en configDias (es decir, es laboral)
          const configDia = configDias.find(
            (cd) => cd.DiaSemana === diaSemanaStr,
          );
          if (configDia) {
            contadorFestivos++;
          }
        } else {
          // Si NO es festivo y NO es conciliación, sumamos los turnos de ese día
          const configDia = configDias.find(
            (cd) => cd.DiaSemana === diaSemanaStr,
          );
          if (configDia) {
            contadorTurnos +=
              (configDia.MaxTurnosAM || 0) + (configDia.MaxTurnosPM || 0);
          }
        }
      }

      // Avanzar un día
      loopDate.setDate(loopDate.getDate() + 1);
    }

    resultado.totalTurnosReales = contadorTurnos;
    resultado.festivosEfectivos = contadorFestivos;

    return resultado;
  }, [
    mainConfig.FechaInicio,
    mainConfig.FechaFin,
    mainConfig.DiaConciliacion,
    configDias,
    festivosData,
  ]);

  // Progreso visual
  const progreso = useMemo(() => {
    let p = 0;
    if (mainConfig.Semestre) p += 25;
    if (mainConfig.FechaInicio && mainConfig.FechaFin) p += 25;
    if (mainConfig.DiaConciliacion) p += 25;
    const gridHasData = configDias.some(
      (i) => i.MaxTurnosAM > 0 || i.MaxTurnosPM > 0,
    );
    if (gridHasData) p += 25;
    return p;
  }, [mainConfig, configDias]);

  const isFormValido = useMemo(() => {
    return (
      mainConfig.Semestre &&
      mainConfig.FechaInicio &&
      mainConfig.FechaFin &&
      mainConfig.DiaConciliacion
    );
  }, [mainConfig]);

  const handleSubmit = async () => {
    if (!isFormValido) {
      setErrorMensaje("Por favor completa los campos requeridos.");
      return;
    }
    setSubmitting(true);
    setErrorMensaje("");
    try {
      const payload = {
        Calendarios: mainConfig,
        ConfiguracionDias: configDias,
        LimitesTurnosConsultorio: LimitesTurnos,
      };

      const respuesta = await PutData(
        "/api/Calendarios/PutCalendarioCompleto",
        payload
      );
      if (!respuesta) {
        throw "Error al actualizar la informacion";
      }
      alert("Actualización del calendario");
    } catch (error) {
      console.error(error);
      setErrorMensaje("Error al guardar la configuración.");
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // 6. RENDER (DISEÑO EXACTO)
  // ==========================================

  if (!infocalendario) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 to-white rounded-2xl p-8 flex items-center justify-center">
        <p className="text-slate-500">Cargando información del calendario...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 to-white rounded-2xl">
      <main className="mx-auto max-w-full px-4 py-8 grid gap-6 lg:grid-cols-3">
        {/* COLUMNA IZQUIERDA: FORMULARIO */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Configuración del Módulo{" "}
                {mainConfig.Anio ? `- ${mainConfig.Anio}` : ""}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* FILA 1: Inputs Principales (Grid de 3) */}
              <div className="grid gap-4 md:grid-cols-3">
                {/* Select Principal */}
                <div className="col-span-3 md:col-span-1">
                  <Label>
                    Semestre del año <span className="text-red-600">*</span>
                  </Label>
                  <Select
                    value={mainConfig.Semestre}
                    onValueChange={(v) => handleMainConfigChange("Semestre", v)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Seleccionar..." />
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

                {/* Fecha Inicio */}
                <div>
                  <Label>
                    Fecha de inicio <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={mainConfig.FechaInicio}
                    onChange={(e) =>
                      handleMainConfigChange("FechaInicio", e.target.value)
                    }
                    className="mt-1"
                  />
                </div>

                {/* Fecha Fin */}
                <div>
                  <Label>
                    Fecha de fin <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={mainConfig.FechaFin}
                    onChange={(e) =>
                      handleMainConfigChange("FechaFin", e.target.value)
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              {/* FILA 2: Opción Secundaria y Progreso */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>
                    Dia de conciliación<span className="text-red-600">*</span>
                  </Label>
                  <Select
                    value={mainConfig.DiaConciliacion}
                    onValueChange={(v) =>
                      handleMainConfigChange("DiaConciliacion", v)
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Seleccionar opción..." />
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

                {/* Barra de Progreso */}
                <div className="flex flex-col justify-end">
                  <div className="flex items-center justify-between mb-1">
                    <Label className="text-slate-700">Progreso</Label>
                    <span className="text-sm text-primary">{progreso}%</span>
                  </div>
                  <Progress value={progreso} />
                </div>
              </div>

              {/* TABS DE CONFIGURACIÓN DETALLADA */}
              <Tabs defaultValue="dias">
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="dias">
                    Días laborales<span className="text-red-600">*</span>
                  </TabsTrigger>
                  <TabsTrigger value="consultorios">
                    Consultorios<span className="text-red-600">*</span>
                  </TabsTrigger>
                </TabsList>
                {/* DÍAS */}
                <TabsContent value="dias" className="space-y-4">
                  <Alert className="bg-amber-50 border-amber-200">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Configura los turnos por día</AlertTitle>
                    <AlertDescription>
                      Los turnos del día de conciliación (
                      <b>{mainConfig.DiaConciliacion || "no seleccionado"}</b>)
                      no se contabilizan para la atención.
                    </AlertDescription>
                  </Alert>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {configDias
                      .filter(
                        (d) =>
                          d.DiaSemana !== mainConfig.DiaConciliacion &&
                          d.DiaSemana !== "N/A",
                      )
                      .map((dia, index) => (
                        <Card key={index} className="shadow-none border-dashed">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base font-semibold tracking-tight">
                              {dia.DiaSemana}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div>
                              <Label>Turnos AM</Label>
                              <Input
                                type="number"
                                min={0}
                                max={20}
                                value={dia.MaxTurnosAM}
                                onChange={(e) =>
                                  handleConfigDiaChange(
                                    dia.DiaSemana,
                                    "MaxTurnosAM",
                                    e.target.value,
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
                                value={dia.MaxTurnosPM}
                                onChange={(e) =>
                                  handleConfigDiaChange(
                                    dia.DiaSemana,
                                    "MaxTurnosPM",
                                    e.target.value,
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
                      {consultorio.map((c) => (
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
                              // Buscamos el valor en el estado LimitesTurnos
                              value={
                                LimitesTurnos.find(
                                  (lt) => lt.ConsultorioId === c.id,
                                )?.LimiteTurnos || 0
                              }
                              onChange={(e) =>
                                handleConsultorioChange(c.id, e.target.value)
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

              {/* Mensajes de Error */}
              {errorMensaje && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{errorMensaje}</AlertDescription>
                </Alert>
              )}
            </CardContent>

            {/* Footer de Acciones */}
            <CardFooter className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="rounded-xl"
                disabled={submitting}
              >
                <RotateCcw className="mr-2 h-4 w-4" /> Limpiar cambios
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!isFormValido || submitting}
                className="rounded-xl"
              >
                {submitting ? "Procesando..." : "Guardar Cambios"}
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* COLUMNA DERECHA: RESUMEN (Sticky-like feel) */}
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
                  {/* Variable reactiva calculada */}
                  <p className="text-2xl font-semibold">{calculos.semanas}</p>
                </div>
                <div className="rounded-xl border p-3">
                  <p className="text-xs text-slate-500">Festivos</p>
                  {/* Variable reactiva calculada */}
                  <p className="text-2xl font-semibold">
                    {calculos.festivosEfectivos}
                  </p>
                </div>
                <div className="rounded-xl border p-3">
                  <p className="text-xs text-slate-500">Turnos/semana</p>
                  {/* Variable reactiva calculada */}
                  <p className="text-2xl font-semibold">
                    {calculos.turnosPromedioSemana}
                  </p>
                </div>
                <div className="rounded-xl border p-3">
                  <p className="text-xs text-slate-500">Turnos totales</p>
                  {/* Variable reactiva calculada */}
                  <p className="text-2xl font-semibold">
                    {calculos.totalTurnosReales}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-slate-500">Rango seleccionado</p>
                <p className="font-medium tracking-tight">
                  {mainConfig.FechaInicio || "—"}{" "}
                  <span className="text-slate-400">→</span>{" "}
                  {mainConfig.FechaFin || "—"}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-slate-500">Día de conciliación</p>
                <p className="font-medium tracking-tight">
                  {mainConfig.DiaConciliacion || "—"}
                </p>
              </div>

              <div className="pt-2">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  {isFormValido ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      Guardar cambios
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
          <span>© {new Date().getFullYear()} Sistema de Gestión</span>
          <span>Versión 1.0</span>
        </div>
      </footer>
    </div>
  );
}
