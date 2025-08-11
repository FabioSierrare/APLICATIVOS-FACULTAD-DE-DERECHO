"use client"
import React, { useState } from 'react';

const CalendarioCreator = () => {
  // Estados (igual que en tu versión original)
  const [semestre, setSemestre] = useState('Q1');
  const [rangoEvento, setRangoEvento] = useState({ inicio: '', fin: '' });
  const [diaConciliacion, setDiaConciliacion] = useState('');
  const [consultorios, setConsultorios] = useState([
    { id: 1, nombre: 'Consultorio 1', turnos: 4 },
    { id: 2, nombre: 'Consultorio 2', turnos: 4 },
    { id: 3, nombre: 'Consultorio 3', turnos: 4 },
    { id: 4, nombre: 'Consultorio 4', turnos: 4 }
  ]);

  // Opciones (igual que en tu versión original)
  const semestres = [
    { value: 'Q1', label: 'Primer Semestre' },
    { value: 'Q2', label: 'Segundo Semestre' }
  ];

  const diasSemana = [
    { value: 'Lunes', label: 'Lunes' },
    { value: 'Martes', label: 'Martes' },
    { value: 'Miércoles', label: 'Miércoles' },
    { value: 'Jueves', label: 'Jueves' },
    { value: 'Viernes', label: 'Viernes' }
  ];

  // Manejadores (igual que en tu versión original)
  const handleRangoChange = (e) => {
    const { name, value } = e.target;
    setRangoEvento(prev => ({ ...prev, [name]: value }));
  };

  const handleConsultorioChange = (id, field, value) => {
    setConsultorios(prev => prev.map(cons => cons.id === id ? { ...cons, [field]: value } : cons));
  };

  const addConsultorio = () => {
    const newId = Math.max(...consultorios.map(c => c.id)) + 1;
    setConsultorios([...consultorios, { id: newId, nombre: `Consultorio ${newId}`, turnos: 4 }]);
  };

  const removeConsultorio = (id) => {
    if (consultorios.length <= 1) return;
    setConsultorios(consultorios.filter(c => c.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md">
      {/* Encabezado mejorado */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-blue-800 mb-2">CONFIGURACIÓN DE CALENDARIO</h1>
        <p className="text-gray-600">Complete los parámetros para generar el calendario</p>
      </div>

      {/* Contenedor de parámetros con diseño de tarjetas */}
      <div className="space-y-6">
        {/* Tarjeta de Semestre */}
        <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
          <h3 className="text-lg font-semibold text-blue-700 mb-3">1. Selección de Semestre</h3>
          <select 
            value={semestre}
            onChange={(e) => setSemestre(e.target.value)}
            className="w-full p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {semestres.map(opcion => (
              <option key={opcion.value} value={opcion.value}>
                {opcion.label}
              </option>
            ))}
          </select>
        </div>

        {/* Tarjeta de Rango de Fechas */}
        <div className="bg-green-50 p-5 rounded-lg border border-green-100">
          <h3 className="text-lg font-semibold text-green-700 mb-3">2. Inicio y Fin del Consultorio</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Inicio</label>
              <input
                type="date"
                name="inicio"
                value={rangoEvento.inicio}
                onChange={handleRangoChange}
                className="w-full p-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Fin</label>
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

        {/* Tarjeta de Día de Conciliación */}
        <div className="bg-purple-50 p-5 rounded-lg border border-purple-100">
          <h3 className="text-lg font-semibold text-purple-700 mb-3">3. Día de Conciliación</h3>
          <select
            value={diaConciliacion}
            onChange={(e) => setDiaConciliacion(e.target.value)}
            className="w-full p-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="">Seleccione un día laboral</option>
            {diasSemana.map(dia => (
              <option key={dia.value} value={dia.value}>
                {dia.label}
              </option>
            ))}
          </select>
        </div>

        {/* Tarjeta de Consultorios */}
        <div className="bg-orange-50 p-5 rounded-lg border border-orange-100">
          <h3 className="text-lg font-semibold text-orange-700 mb-3">4. Configuración de Consultorios</h3>
          
          <div className="space-y-4">
            {consultorios.map(consultorio => (
              <div key={consultorio.id} className="flex flex-col md:flex-row gap-3 items-center bg-white p-3 rounded-lg shadow-sm">
                <input
                  type="text"
                  value={consultorio.nombre}
                  onChange={(e) => handleConsultorioChange(consultorio.id, 'nombre', e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Nombre del consultorio"
                />
                
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Turnos:</span>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={consultorio.turnos}
                    onChange={(e) => handleConsultorioChange(consultorio.id, 'turnos', parseInt(e.target.value) || 1)}
                    className="w-20 p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                
               
              </div>
            ))}
            
            
          </div>
        </div>
      </div>

      {/* Botón de acción principal */}
      <div className="mt-8 text-center">
        <button className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg">
          Generar Calendario
        </button>
      </div>
    </div>
  );
};

export default CalendarioCreator;