"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useFetchData from "@/components/FetchData";
import { postData } from "@/components/FetchPost";

// Componentes UI
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
import {
  CalendarDays,
  Building2,
  AlertTriangle,
  ChevronRight,
  Info,
  ArrowLeft,
} from "lucide-react";

export default function EditarCalendario({ calendarioId, onCancel }) {
  const router = useRouter();
  
  // Estado para el calendario a editar
  const [calendarioEditar, setCalendarioEditar] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Estados del formulario (los mismos que en CalendarioAbogadasUI)
  const [rangoEvento, setRangoEvento] = useState({ inicio: "", fin: "" });
  const [diaConciliacion, setDiaConciliacion] = useState("");
  const [semestre, setSemestre] = useState("");
  const [festivosFiltrados, setFestivosFiltrados] = useState([]);
  const [totalFestivos, setTotalFestivos] = useState(0);
  const [errorMensaje, setErrorMensaje] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [configDias, setConfigDias] = useState([]);
  const [consultorios, setConsultorios] = useState([]);
  
  const [FormularioCalendarios, setFormularioCalendario] = useState({
    Calendarios: {},
    LimitesTurnosConsultorio: [],
    ConfiguracionDias: [],
  });

  const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
  const semestreOptions = [
    { value: "S1", label: "Primer Semestre" },
    { value: "S2", label: "Segundo Semestre" },
  ];

  // ======= FETCH CALENDARIO A EDITAR =======
  useEffect(() => {
    const fetchCalendario = async () => {
      if (!calendarioId) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/Calendarios/GetCalendarioCompleto/${calendarioId}`);
        const data = await response.json();
        
        if (response.ok) {
          setCalendarioEditar(data);
          cargarDatosFormulario(data);
        } else {
          setErrorMensaje("Error al cargar el calendario");
        }
      } catch (error) {
        setErrorMensaje("Error de conexión");
      } finally {
        setLoading(false);
      }
    };

    fetchCalendario();
  }, [calendarioId]);

  // ======= CARGAR DATOS EN FORMULARIO =======
  const cargarDatosFormulario = (calendario) => {
    if (!calendario) return;

    // Inicializar rango de fechas
    setRangoEvento({
      inicio: calendario.FechaInicio
        ? new Date(calendario.FechaInicio).toISOString().split("T")[0]
        : "",
      fin: calendario.FechaFin
        ? new Date(calendario.FechaFin).toISOString().split("T")[0]
        : "",
    });

    setSemestre(calendario.Semestre || "");
    setDiaConciliacion(calendario.DiaConciliacion || "");

    // Configuración de días
    const diasConfig = diasSemana.map((d) => {
      const diaConfig = calendario.ConfiguracionDias?.find(
        (cd) => cd.DiaSemana === d
      );
      return {
        dia: d,
        maxTurnosAM: diaConfig?.MaxTurnosAM || 0,
        maxTurnosPM: diaConfig?.MaxTurnosPM || 0,
      };
    });
    setConfigDias(diasConfig);

    // Consultorios
    const consultoriosData = calendario.LimitesTurnosConsultorio?.map((c) => ({
      id: c.ConsultorioId,
      nombre: c.Nombre || `Consultorio ${c.ConsultorioId}`,
      turnos: c.LimiteTurnos,
    })) || [];
    setConsultorios(consultoriosData);

    // Formulario completo
    setFormularioCalendario({
      Calendarios: {
        id: calendario.id,
        Anio: new Date(calendario.FechaInicio).getFullYear(),
        Semestre: calendario.Semestre,
        FechaInicio: new Date(calendario.FechaInicio),
        FechaFin: new Date(calendario.FechaFin),
        DiaConciliacion: calendario.DiaConciliacion,
        Estado: calendario.Estado || "Activo",
      },
      LimitesTurnosConsultorio: calendario.LimitesTurnosConsultorio || [],
      ConfiguracionDias: calendario.ConfiguracionDias || [],
    });
  };

  // ======= FETCH CONSULTORIOS (igual que el original) =======
  const { data: consultorio, loading: loadingConsultorios } = useFetchData(
    "/api/Consultorios/GetConsultorios"
  );

  useEffect(() => {
    if (Array.isArray(consultorio) && consultorios.length === 0) {
      const consultoriosFormateados = consultorio.map((c) => ({
        id: c.id,
        nombre: c.nombre,
        turnos: 3,
      }));
      setConsultorios(consultoriosFormateados);
    }
  }, [consultorio, consultorios.length]);

  // ======= EFECTOS PARA ACTUALIZAR FORMULARIO (igual que el original) =======
  useEffect(() => {
    setFormularioCalendario((prev) => ({
      ...prev,
      LimitesTurnosConsultorio: consultorios.map((c) => ({
        CalendarioId: calendarioId || 0,
        ConsultorioId: c.id,
        LimiteTurnos: c.turnos,
      })),
    }));
  }, [consultorios, calendarioId]);

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
        Estado: prev.Calendarios.Estado || "Activo",
      },
    }));
  }, [rangoEvento, diaConciliacion, semestre]);

  useEffect(() => {
    setFormularioCalendario((prev) => ({
      ...prev,
      ConfiguracionDias: configDias.map((d) => ({
        DiaSemana: d.dia,
        CalendarioId: calendarioId || 0,
        MaxTurnosAM: d.maxTurnosAM,
        MaxTurnosPM: d.maxTurnosPM,
      })),
    }));
  }, [configDias, calendarioId]);

  // ======= HANDLERS (igual que el original) =======
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

  // ======= VALIDATIONS & CALCS (igual que el original) =======
  const validarFormulario = () => {
    // ... (misma implementación que el componente original)
    // Copiar la función validarFormulario del componente original aquí
    return true; // Placeholder
  };

  // ======= SUBMIT PARA EDICIÓN =======
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;
    
    try {
      setSubmitting(true);
      const respuesta = await postData(
        `/api/Calendarios/Actualizar/${calendarioId}`,
        FormularioCalendarios
      );
      
      if (!respuesta) {
        setErrorMensaje(respuesta?.message || "Error al actualizar los datos");
        setSubmitting(false);
        return;
      }
      
      setSubmitting(false);
      alert("Calendario actualizado correctamente");
      if (onCancel) onCancel(); // Cerrar el modo edición
      // O redirigir: router.push("/admin/calendarios-creados");
      
    } catch (err) {
      setSubmitting(false);
      setErrorMensaje(err?.message || "Error inesperado al actualizar");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Cargando calendario...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 to-white">
      {/* Header de edición */}
      <div className="bg-white border-b px-4 py-4 flex items-center gap-4">
        <Button variant="outline" onClick={onCancel} className="rounded-xl">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <h1 className="text-xl font-semibold">Editando Calendario</h1>
      </div>

      {/* Resto del formulario (igual que el original) */}
      <main className="mx-auto max-w-full px-4 py-8 grid gap-6 lg:grid-cols-3">
        {/* Left Column: Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" /> Editando calendario
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Los mismos campos del formulario original */}
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

              {/* ... resto del formulario (copiar del original) */}
              
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
                onClick={onCancel}
                className="rounded-xl"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="rounded-xl"
              >
                {submitting ? "Actualizando…" : "Actualizar calendario"}
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Right Column: Summary (igual que el original) */}
        <div className="space-y-6">
          {/* Resumen (copiar del original) */}
        </div>
      </main>
    </div>
  );
}