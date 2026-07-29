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
  LayoutDashboard,
  List,
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

// --- Hooks Mockeados (Reemplazar por los reales) ---
// import useFetchData from "@/components/FetchData"; // No se usaba en el ejemplo
import { useUltimoCalendario } from "@/components/UltimoCalendario";
import useFetchData from "@/components/FetchData";
// import { postData } from "@/components/FetchPost"; // No se usaba en el ejemplo

export default function EditarCalendario({ id }) {
  const router = useRouter();

  const infocalendario = useFetchData(`/api/Calendarios/CalendarioCompleto/${id}`)
  const calendario = useUltimoCalendario()

  // --- FUNCIÓN AUXILIAR PARA FECHAS ---
  // Convierte una fecha de la BDD a formato YYYY-MM-DD para el input
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    // Aseguramos que sea una fecha válida antes de formatear
    return isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
  };

  // ==========================================
  // 1. ESTADOS (General y Listas)
  // ==========================================

  // A. Configuración Principal (Inputs superiores)
  // CORRECCIÓN: Unificamos nombres de variables (camelCase) para que coincidan con los inputs
  const [mainConfig, setMainConfig] = useState({
    semestre: "", // Antes opcionPrincipal / Semestre
    fechaInicio: "",
    fechaFin: "",
    diaConciliacion: "", // Antes opcionSecundaria / DiaConciliacion
    anio: "", // Agregado para mantener consistencia con la carga
    estado: "", // Agregado
    id: null, // Agregado
  });

  const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "N/A"];
  const semestreOptions = [
    { value: "S1", label: "Primer" },
    { value: "S2", label: "Segundo" },
  ];
  // B. Lista para TAB 1 (Ej: Días, Categorías, etc - Grid de Cards)
  const [gridItems, setGridItems] = useState([
    // Mantenemos los datos dummy iniciales para que se vea el diseño
    { id: "Item 1", valA: 0, valB: 0 },
    { id: "Item 2", valA: 0, valB: 0 },
    { id: "Item 3", valA: 0, valB: 0 },
    { id: "Item 4", valA: 0, valB: 0 },
    { id: "Item 5", valA: 0, valB: 0 },
  ]);

  // C. Lista para TAB 2 (Ej: Consultorios, Entidades - Lista Vertical)
  const [listItems, setListItems] = useState([]);

  // D. Estados de UI
  const [errorMensaje, setErrorMensaje] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ==========================================
  // 2. FETCH DE DATOS (Carga inicial)
  // ==========================================

  useEffect(() => {
    if (calendario) {
      // CORRECCIÓN IMPORTANTE:
      // 1. Usamos los nombres de variables unificados (semestre, fechaInicio...)
      // 2. Formateamos las fechas a string YYYY-MM-DD en lugar de usar new Date() directo.
      setMainConfig({
        anio: calendario.anio,
        diaConciliacion: calendario.diaConciliacion
          ? String(calendario.diaConciliacion)
          : "", // Asegurar que sea string para el Select
        fechaInicio: formatDateForInput(calendario.fechaInicio),
        fechaFin: formatDateForInput(calendario.fechaFin),
        estado: calendario.estado,
        id: calendario.id,
        semestre: calendario.semestre || "",
      });

      // Opcional: Si 'calendario' trae detalles, podrías actualizar gridItems aquí:
      // if (calendario.detalles) setGridItems(calendario.detalles);
    }
  }, [calendario]);

  // ==========================================
  // 3. HANDLERS
  // ==========================================

  const handleMainConfigChange = (field, value) => {
    setMainConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleGridItemChange = (id, field, value) => {
    // Aseguramos que el valor sea un número, si es NaN se usa 0
    const numericValue = value === "" ? 0 : parseInt(value, 10);
    setGridItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, [field]: isNaN(numericValue) ? 0 : numericValue }
          : item,
      ),
    );
  };

  const handleListItemChange = (id, value) => {
    const numericValue = value === "" ? 0 : parseInt(value, 10);
    setListItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, valor: isNaN(numericValue) ? 0 : numericValue }
          : item,
      ),
    );
  };

  // ==========================================
  // 4. CÁLCULOS & VALIDACIONES (Lógica Reactiva)
  // ==========================================

  // Cálculos para el Panel Derecho (Resumen)
  const resumen = useMemo(() => {
    // Agregamos protección (|| 0) por si algún valor viene nulo
    const totalGrid = gridItems.reduce(
      (acc, i) => acc + (i.valA || 0) + (i.valB || 0),
      0,
    );
    const totalList = listItems.reduce((acc, i) => acc + (i.valor || 0), 0);

    let dias = 0;
    // Solo calculamos si las fechas son strings válidos no vacíos
    if (mainConfig.fechaInicio && mainConfig.fechaFin) {
      const d1 = new Date(mainConfig.fechaInicio);
      const d2 = new Date(mainConfig.fechaFin);
      // Validamos que las fechas sean objetos Date válidos antes de restar
      if (!isNaN(d1.getTime()) && !isNaN(d2.getTime()) && d2 >= d1) {
        dias = Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
      }
    }

    return {
      metric1: dias,
      metric2: totalList,
      metric3: totalGrid,
      totalGlobal: totalGrid * (dias > 0 ? dias : 1), // Evitar multiplicar por 0 si no hay fechas
    };
  }, [mainConfig.fechaInicio, mainConfig.fechaFin, gridItems, listItems]);

  // Progreso Visual (Barra de carga)
  const progreso = useMemo(() => {
    let p = 0;
    // Usamos las nuevas keys del estado
    if (mainConfig.semestre) p += 25;
    if (mainConfig.fechaInicio && mainConfig.fechaFin) p += 25;
    // Ajustamos la lógica de progreso según tus necesidades reales
    if (mainConfig.diaConciliacion) p += 25;
    const gridHasData = gridItems.some((i) => i.valA > 0 || i.valB > 0);
    if (gridHasData) p += 25;

    return p;
  }, [mainConfig, gridItems]);

  const isFormValido = useMemo(() => {
    // Validamos usando las keys correctas
    return (
      mainConfig.semestre &&
      mainConfig.fechaInicio &&
      mainConfig.fechaFin &&
      mainConfig.diaConciliacion
    );
  }, [mainConfig]);

  // ==========================================
  // 5. SUBMIT
  // ==========================================
  const handleSubmit = async () => {
    if (!isFormValido) {
      setErrorMensaje("Por favor completa los campos requeridos.");
      return;
    }

    setSubmitting(true);
    setErrorMensaje(""); // Limpiar errores previos
    try {
      const payload = {
        ...mainConfig,
        detalles: gridItems,
        externos: listItems,
      };

      // Simulación de espera
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // const res = await postData("/api/...", payload);
      // if (!res) throw new Error("Error...");

      alert("Proceso completado correctamente (Simulado)");
      // router.push("/admin/...");
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
    // Un estado de carga simple que respeta el layout
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 to-white rounded-2xl p-8 flex items-center justify-center">
        <p className="text-slate-500">Cargando información del calendario...</p>
      </div>
    );
  }

  // CORRECCIÓN: Eliminado el error de sintaxis "console.l;" que había aquí.

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 to-white rounded-2xl">
      <main className="mx-auto max-w-full px-4 py-8 grid gap-6 lg:grid-cols-3">
        {/* COLUMNA IZQUIERDA: FORMULARIO */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {/* Icono Principal */}
                <CalendarDays className="h-5 w-5" />
                Configuración del Módulo{" "}
                {mainConfig.anio ? `- ${mainConfig.anio}` : ""}
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
                  {/* CORRECCIÓN: value={mainConfig.semestre} y handle...("semestre", v) */}
                  <Select
                    value={mainConfig.semestre}
                    onValueChange={(v) => handleMainConfigChange("semestre", v)}
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
                    // CORRECCIÓN: Ahora recibe un string YYYY-MM-DD correctamente
                    value={mainConfig.fechaInicio}
                    onChange={(e) =>
                      handleMainConfigChange("fechaInicio", e.target.value)
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
                    // CORRECCIÓN: Ahora recibe un string YYYY-MM-DD correctamente
                    value={mainConfig.fechaFin}
                    onChange={(e) =>
                      handleMainConfigChange("fechaFin", e.target.value)
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
                  {/* CORRECCIÓN: value={mainConfig.diaConciliacion} y handle...("diaConciliacion", v) */}
                  <Select
                    value={mainConfig.diaConciliacion}
                    onValueChange={(v) =>
                      handleMainConfigChange("diaConciliacion", v)
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Seleccionar opción..." />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Asumiendo valores de ejemplo, ajusta según tus datos reales */}
                      <SelectItem value="5">Día 5</SelectItem>
                      <SelectItem value="10">Día 10</SelectItem>
                      <SelectItem value="15">Día 15</SelectItem>
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
              <Tabs defaultValue="tab1">
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="tab1">Dias laborales</TabsTrigger>
                  <TabsTrigger value="tab2">Consultorios</TabsTrigger>
                </TabsList>

                {/* TAB 1: Grid de Tarjetas (Estilo "Días") */}
                <TabsContent value="tab1" className="space-y-4">
                  <Alert className="bg-amber-50 border-amber-200">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Información</AlertTitle>
                    <AlertDescription>
                      Ajusta los valores individuales para cada elemento de la
                      cuadrícula.
                    </AlertDescription>
                  </Alert>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {gridItems.map((item) => (
                      <Card key={item.id} className="shadow-none border-dashed">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base font-semibold tracking-tight">
                            {item.id}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <Label>Parámetro A</Label>
                            {/* CORRECCIÓN: value={item.valA || ''} evita warning si es 0 */}
                            <Input
                              type="number"
                              min={0}
                              value={item.valA}
                              onChange={(e) =>
                                handleGridItemChange(
                                  item.id,
                                  "valA",
                                  e.target.value,
                                )
                              }
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label>Parámetro B</Label>
                            <Input
                              type="number"
                              min={0}
                              value={item.valB}
                              onChange={(e) =>
                                handleGridItemChange(
                                  item.id,
                                  "valB",
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

                {/* TAB 2: Lista Vertical (Estilo "Consultorios") */}
                <TabsContent value="tab2" className="space-y-3">
                  {/* CORRECCIÓN: Cambiado 'true' por una condición real. Si la lista está vacía, muestra el mensaje */}
                  {listItems.length === 0 ? (
                    <div className="py-6 text-center border border-dashed rounded-xl">
                      <p className="text-sm text-slate-500">
                        No hay consultorios asignados o están cargando...
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {listItems.map((item) => (
                        <div
                          key={item.id}
                          className="grid gap-3 md:grid-cols-[1fr,auto] items-center rounded-2xl border p-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 grid place-items-center rounded-xl bg-slate-100">
                              <Building2 className="h-5 w-5 text-slate-600" />
                            </div>
                            <Input
                              readOnly
                              value={item.titulo}
                              className="border-none shadow-none focus-visible:ring-0 bg-transparent font-medium"
                            />
                          </div>
                          <div className="flex items-center gap-2 justify-end">
                            <Label className="text-sm">Valor</Label>
                            <Input
                              type="number"
                              min={1}
                              value={item.valor}
                              onChange={(e) =>
                                handleListItemChange(item.id, e.target.value)
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
                <RotateCcw className="mr-2 h-4 w-4" /> Limpiar
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
              {/* Cuadrícula de Métricas (2x2) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border p-3">
                  <p className="text-xs text-slate-500">Días Totales</p>
                  <p className="text-2xl font-semibold">{resumen.metric1}</p>
                </div>
                <div className="rounded-xl border p-3">
                  <p className="text-xs text-slate-500">Total Listas</p>
                  {/* Se usó metric2 que corresponde a totalList */}
                  <p className="text-2xl font-semibold">{resumen.metric2}</p>
                </div>
                <div className="rounded-xl border p-3">
                  <p className="text-xs text-slate-500">Total Grid (Diario)</p>
                  {/* Se usó metric3 que corresponde a totalGrid */}
                  <p className="text-2xl font-semibold">{resumen.metric3}</p>
                </div>
                <div className="rounded-xl border p-3">
                  <p className="text-xs text-slate-500">Estimado Global</p>
                  <p className="text-2xl font-semibold">
                    {resumen.totalGlobal}
                  </p>
                </div>
              </div>

              {/* Lista de Detalles Texto */}
              <div className="space-y-1">
                <p className="text-xs text-slate-500">Rango seleccionado</p>
                <p className="font-medium tracking-tight">
                  {mainConfig.fechaInicio || "—"}{" "}
                  <span className="text-slate-400">→</span>{" "}
                  {mainConfig.fechaFin || "—"}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-slate-500">Semestre</p>
                {/* CORRECCIÓN: Usar la variable correcta mainConfig.semestre */}
                <p className="font-medium tracking-tight">
                  {mainConfig.semestre
                    ? `Semestre ${mainConfig.semestre}`
                    : "Pendiente"}
                </p>
              </div>

              {/* Indicador de Estado Final */}
              <div className="pt-2 border-t mt-2">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  {isFormValido ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span className="text-emerald-700 font-medium">
                        Listo para generar
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <span className="text-amber-700">
                        Faltan datos requeridos
                      </span>
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
