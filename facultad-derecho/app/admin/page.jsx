"use client";
import React, { useState, useEffect } from "react";
import useFetchData from "@/components/FetchData";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import { postData } from "@/components/FetchPost";

const CalendarioCreator = () => {
  // Estados
  const [rangoEvento, setRangoEvento] = useState({ inicio: "", fin: "" });
  const [diaConciliacion, setDiaConciliacion] = useState("");
  const [semestre, setSemestre] = useState("");
  const [festivosFiltrados, setFestivosFiltrados] = useState([]);
  const [totalFestivos, setTotalFestivos] = useState(0);
  const router = useRouter();
  const [errorMensaje, setErrorMensaje] = useState(""); // Nuevo estado para mostrar el error
  const [FormularioCalendarios, setFormularioCalendario] = useState({
    Calendarios: {
      
    },
    LimitesTurnosConsultorio: [{ ConsultorioId: 0, LimiteTurnos: 0 }],
    ConfiguracionDias: [
    ],
  });

  //agregando los valores a calendario
  useEffect(() => {
  const inicio = new Date(rangoEvento.inicio);
  const fin = new Date(rangoEvento.fin);

  setFormularioCalendario((prev) => ({
    ...prev,
    Calendarios: {
      ...prev.Calendarios,
      Anio: inicio.getFullYear(),
      Semestre: semestre,
      FechaInicio: inicio,
      FechaFin: fin,
      DiaConciliacion: diaConciliacion,
      Estado: "Activo" // ahora se actualizará correctamente
    },
  }));
}, [rangoEvento, diaConciliacion, semestre]); // <--- importante agregar diaConciliacion

  const handlerChange = (e, section, index = null) => {
    const value =
      e.target.type === "number" ? Number(e.target.value) : e.target.value;

    setFormularioCalendario((prev) => {
      if (section === "ConfiguracionDias" && index !== null) {
        const updatedConfig = [...prev.ConfiguracionDias];
        updatedConfig[index] = {
          ...updatedConfig[index],
          [e.target.name]: value,
        };
        return {
          ...prev,
          ConfiguracionDias: updatedConfig,
        };
      } else {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [e.target.name]: value,
          },
        };
      }
    });
  };

  const validarFormulario = () => {
    const { Calendarios, LimitesTurnosConsultorio, ConfiguracionDias } =
      FormularioCalendarios;

    // Validar campos básicos del calendario
    if (
      !Calendarios.Anio ||
      !Calendarios.Semestre ||
      !Calendarios.FechaInicio ||
      !Calendarios.FechaFin ||
      !Calendarios.DiaConciliacion
    ) {
      setErrorMensaje("Por favor, completa todos los campos del calendario.");
      return false;
    }

    // Validar que las fechas tengan sentido
    if (Calendarios.FechaFin < Calendarios.FechaInicio) {
      setErrorMensaje(
        "La fecha de fin debe ser igual o posterior a la fecha de inicio."
      );
      return false;
    }

    // Validar que haya al menos un consultorio con nombre y turnos válidos
    for (const c of LimitesTurnosConsultorio) {
      if (!c.ConsultorioId || c.LimiteTurnos <= 0) {
        setErrorMensaje(
          "Cada consultorio debe tener un límite de turnos mayor a 0."
        );
        return false;
      }
    }

    // Validar ConfiguracionDias: que tengan nombre y turnos válidos
    for (const d of ConfiguracionDias) {
      if (!d.DiaSemana || d.MaxTurnosAM < 0 || d.MaxTurnosPM < 0) {
        setErrorMensaje(
          "Cada día debe tener nombre y al menos 1 turno en AM y PM."
        );
        return false;
      }
    }

    setErrorMensaje(""); // Limpio error si todo está bien
    return true;
  };

 const isFormularioValido = () => {
  const { Calendarios, LimitesTurnosConsultorio, ConfiguracionDias } = FormularioCalendarios;

  // Validar fechas
  const inicioValido = Calendarios.FechaInicio instanceof Date && !isNaN(Calendarios.FechaInicio);
  const finValido = Calendarios.FechaFin instanceof Date && !isNaN(Calendarios.FechaFin);

  return (
    Calendarios.Anio &&
    Calendarios.Semestre &&
    inicioValido &&
    finValido &&
    Calendarios.DiaConciliacion &&
    LimitesTurnosConsultorio.every(c => c.LimiteTurnos > 0) &&
    ConfiguracionDias.every(d => d.MaxTurnosAM >= 0 && d.MaxTurnosPM >= 0 && d.DiaSemana)
  );
};


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return; // Si no pasa validación, no envía
    }

    try {
      const respuesta = await postData(
        "/api/Calendarios/PostTodoForm",
        FormularioCalendarios
      );

      console.log(respuesta)
      if (!respuesta) {
        setErrorMensaje(respuesta.message || "Error al guardar los datos");
        return;
      }

      alert("Calendario guardado correctamente");
      router.push("/admin/calendarios-creados");
    } catch (error) {
      setErrorMensaje(error.message);
    }
  };

  // 🔹 Calcular festivos filtrados en tiempo real
  useEffect(() => {
    const obtenerFestivos = async () => {
      if (!rangoEvento.inicio || !rangoEvento.fin) return;

      const inicio = new Date(rangoEvento.inicio);
      const fin = new Date(rangoEvento.fin);

      const response = await fetch(
        `https://date.nager.at/api/v3/PublicHolidays/${inicio.getFullYear()}/CO`
      );
      const festivos = await response.json();

      // Filtrar por rango y que no sea el día de conciliación
      const filtrados = festivos.filter((festivo) => {
        const fechaFestivo = new Date(festivo.date);
        return (
          fechaFestivo >= inicio &&
          fechaFestivo <= fin &&
          fechaFestivo.getDay() !==
            ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"].indexOf(
              diaConciliacion
            )
        );
      });

      setFestivosFiltrados(filtrados);
      setTotalFestivos(filtrados.length);
    };

    obtenerFestivos();
  }, [rangoEvento.inicio, rangoEvento.fin, diaConciliacion]);

  const {
    data: consultorio,
    loading,
    error,
  } = useFetchData("/api/Consultorios/GetConsultorios");

  const [consultorios, setConsultorios] = useState([]);

  useEffect(() => {
    if (consultorio && Array.isArray(consultorio)) {
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

  // Opciones
  const semestres = [
    { value: "S1", label: "Primer Semestre" },
    { value: "S2", label: "Segundo Semestre" },
  ];

  const [configDias, setConfigDias] = useState([
    { dia: "Lunes", maxTurnosAM: 0, maxTurnosPM: 0 },
    { dia: "Martes", maxTurnosAM: 0, maxTurnosPM: 0 },
    { dia: "Miércoles", maxTurnosAM: 0, maxTurnosPM: 0 },
    { dia: "Jueves", maxTurnosAM: 0, maxTurnosPM: 0 },
    { dia: "Viernes", maxTurnosAM: 0, maxTurnosPM: 0 },
  ]);

  const diasSemana = [
    { value: "Lunes", label: "Lunes" },
    { value: "Martes", label: "Martes" },
    { value: "Miércoles", label: "Miércoles" },
    { value: "Jueves", label: "Jueves" },
    { value: "Viernes", label: "Viernes" },
  ];

  // Manejadores
  const handleRangoChange = (e) => {
    const { name, value } = e.target;
    setRangoEvento((prev) => ({ ...prev, [name]: value }));
  };

  const handleConsultorioChange = (id, field, value) => {
    setConsultorios((prev) =>
      prev.map((cons) => (cons.id === id ? { ...cons, [field]: value } : cons))
    );
  };

  const handleConfigDiaChange = (diaSeleccionado, campo, valor) => {
    setConfigDias((prev) =>
      prev.map((dia) =>
        dia.dia === diaSeleccionado
          ? { ...dia, [campo]: parseInt(valor) || 0 }
          : dia
      )
    );
  };

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

  // Filtrar días excluyendo el de conciliación
  const diasConfigurables = configDias.filter(
    (dia) => dia.dia !== diaConciliacion
  );

  // Calcular total de turnos por semana (AM + PM)
  const totalTurnosSemana = diasConfigurables.reduce(
    (total, dia) => total + (dia.maxTurnosAM || 0) + (dia.maxTurnosPM || 0),
    0
  );

  // Calcular semanas totales
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

  // 🔹 Total de turnos reales descontando festivos
  const totalTurnosReales =
    totalSemanas * totalTurnosSemana - totalFestivos - totalSemanas;

    console.log(FormularioCalendarios)
    console.log(typeof(maxTurnosAM))
  return (
    <div className="w-3xl mx-auto p-6 bg-white rounded-xl shadow-md">
      {/* Encabezado */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-blue-800 mb-2">
          CONFIGURACIÓN DE CALENDARIO
        </h1>
        <p className="text-gray-600">
          Complete los parámetros para generar el calendario
        </p>
      </div>

      {/* Parámetros */}
      <div className="space-y-6">
        {/* Semestre */}
        <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
          <h3 className="text-lg font-semibold text-blue-700 mb-3">
            1. Selección de Semestre
          </h3>
          <select
            name="Semestre" // <- nombre de la propiedad dentro de Calendarios
            value={semestre}
            onChange={(e) => setSemestre(e.target.value)}
            className="w-full p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Seleccione un semestre</option>
            {semestres.map((opcion) => (
              <option key={opcion.value} value={opcion.value}>
                {opcion.label}
              </option>
            ))}
          </select>
        </div>

        {/* Rango de Fechas */}
        <div className="bg-green-50 p-5 rounded-lg border border-green-100">
          <h3 className="text-lg font-semibold text-green-700 mb-3">
            2. Inicio y Fin del Consultorio
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Inicio
              </label>
              <input
                type="date"
                name="inicio"
                value={rangoEvento.inicio}
                onChange={handleRangoChange}
                className="w-full p-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Fin
              </label>
              <input
                type="date"
                name="fin"
                value={rangoEvento.fin}
                onChange={handleRangoChange}
                className="w-full p-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
        </div>

        {/* Día de Conciliación */}
        <div className="bg-purple-50 p-5 rounded-lg border border-purple-100">
          <h3 className="text-lg font-semibold text-purple-700 mb-3">
            3. Día de Conciliación
          </h3>
          <select
            value={diaConciliacion}
            onChange={(e) => setDiaConciliacion(e.target.value)}
            className="w-full p-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="">Seleccione un día laboral</option>
            {diasSemana.map((dia) => (
              <option key={dia.value} value={dia.value}>
                {dia.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Configuración de Días Laborales */}
      <div className="bg-yellow-50 p-5 rounded-lg border border-yellow-100 mt-6">
        <h3 className="text-lg font-semibold text-yellow-700 mb-3">
          4. Configuración de Días Laborales
        </h3>
        <p className="text-sm text-yellow-600 mb-4">
          Configure los turnos máximos para cada día (excepto el día de
          conciliación: {diaConciliacion || "No seleccionado"})
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {diasConfigurables.map((dia) => (
            <div
              key={dia.dia}
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
            >
              <h4 className="font-medium text-gray-800 mb-3 text-center">
                {dia.dia}
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Turnos Mañana (AM)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={dia.maxTurnosAM}
                    onChange={(e) =>
                      handleConfigDiaChange(
                        dia.dia,
                        "maxTurnosAM",
                        e.target.value
                      )
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Turnos Tarde (PM)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={dia.maxTurnosPM}
                    onChange={(e) =>
                      handleConfigDiaChange(
                        dia.dia,
                        "maxTurnosPM",
                        e.target.value
                      )
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 p-3 bg-white border border-blue-200 rounded-lg text-center">
        <span className="text-blue-700 font-semibold">
          Total de turnos disponibles: {totalTurnosReales}
        </span>
      </div>

      {/* Consultorios */}
      <div className="bg-orange-50 p-5 rounded-lg border border-orange-100 mt-6">
        <h3 className="text-lg font-semibold text-orange-700 mb-3">
          5. Configuración de Consultorios
        </h3>
        <div className="space-y-4">
          {consultorios.map((consultorio) => (
            <div
              key={consultorio.id}
              className="flex flex-col md:flex-row gap-3 items-center bg-white p-3 rounded-lg shadow-sm"
            >
              <input
                type="text"
                readOnly
                value={consultorio.nombre}
                onChange={(e) =>
                  handleConsultorioChange(
                    consultorio.id,
                    "nombre",
                    e.target.value
                  )
                }
                className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                placeholder="Nombre del consultorio"
              />
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  Turnos:
                </span>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={consultorio.turnos}
                  onChange={(e) =>
                    handleConsultorioChange(
                      consultorio.id,
                      "turnos",
                      parseInt(e.target.value) || 1
                    )
                  }
                  className="w-20 p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Botón principal */}
      <div className="mt-8 text-center">
        <button
          onClick={handleSubmit}
          disabled={!isFormularioValido()}
          className={`px-8 py-3 rounded-lg font-medium shadow-md transition-colors ${
            isFormularioValido()
              ? "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg cursor-pointer"
              : "bg-gray-300 text-gray-600 cursor-not-allowed"
          }`}
        >
          Generar Calendario
        </button>
      </div>
    </div>
  );
};

export default CalendarioCreator;
