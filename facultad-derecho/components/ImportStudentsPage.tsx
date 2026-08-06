"use client";

import React, { useState } from "react";
import {
  Upload,
  FileSpreadsheet,
  GripVertical,
  Info,
  Pencil,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";

export default function ImportStudentsPage() {
  const [selectedFile, setSelectedFile] = useState<string | null>(
    "estudiantes.xlsx",
  );

  // Datos mock para la vista previa de estudiantes
  const [students, setStudents] = useState([
    {
      id: 1,
      nombre: "María Paula González",
      documento: "1012345678",
      tipoDoc: "Cédula de ciudadanía",
      correo: "maria.gonzalez@unicolmayor.edu.co",
      consultorio: "1",
    },
    {
      id: 2,
      nombre: "Juan Camilo Rodríguez",
      documento: "1034567891",
      tipoDoc: "Cédula de ciudadanía",
      correo: "juan.rodriguez@unicolmayor.edu.co",
      consultorio: "2",
    },
    {
      id: 3,
      nombre: "Laura Sofía Martínez",
      documento: "1009876543",
      tipoDoc: "Tarjeta de identidad",
      correo: "laura.martinez@unicolmayor.edu.co",
      consultorio: "3",
    },
    {
      id: 4,
      nombre: "Andrés Felipe Herrera",
      documento: "1076543210",
      tipoDoc: "Cédula de ciudadanía",
      correo: "andres.herrera@unicolmayor.edu.co",
      consultorio: "4",
    },
    {
      id: 5,
      nombre: "Valentina López Díaz",
      documento: "1045678901",
      tipoDoc: "Cédula de ciudadanía",
      correo: "valentina.lopez@unicolmayor.edu.co",
      consultorio: "5",
    },
  ]);

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* ================= STEPPER SUPERIOR ================= */}
        <div className="flex items-center justify-between max-w-4xl mx-auto px-4">
          {/* Paso 1 */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-blue-900 text-white flex items-center justify-center font-semibold text-sm">
              1
            </div>
            <div>
              <p className="font-semibold text-sm text-slate-900">
                Subir archivo
              </p>
              <p className="text-xs text-slate-500">
                Selecciona el archivo con los estudiantes
              </p>
            </div>
          </div>

          <div className="h-[2px] flex-1 bg-slate-300 mx-4" />

          {/* Paso 2 */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-blue-900 text-white flex items-center justify-center font-semibold text-sm">
              2
            </div>
            <div>
              <p className="font-semibold text-sm text-slate-900">
                Asignar columnas
              </p>
              <p className="text-xs text-slate-500">
                Relaciona las columnas del archivo
              </p>
            </div>
          </div>

          <div className="h-[2px] flex-1 bg-slate-300 mx-4" />

          {/* Paso 3 */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-slate-300 text-slate-600 flex items-center justify-center font-semibold text-sm">
              3
            </div>
            <div>
              <p className="font-semibold text-sm text-slate-500">
                Revisar y confirmar
              </p>
              <p className="text-xs text-slate-400">
                Verifica los datos antes de guardar
              </p>
            </div>
          </div>
        </div>

        {/* ================= SECCIÓN 1: SUBIR ARCHIVO ================= */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">1. Subir archivo</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Box de Carga */}
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50/50 hover:bg-slate-100/50 transition-colors flex flex-col items-center justify-center">
              <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <p className="font-semibold text-sm text-slate-800">
                Selecciona un archivo
              </p>
              <p className="text-xs text-slate-500 mb-4">
                Formatos permitidos: .csv, .xlsx
              </p>
              <button className="bg-blue-900 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-blue-950 transition-colors">
                Seleccionar archivo
              </button>
            </div>

            {/* Archivo Seleccionado */}
            {selectedFile && (
              <div className="bg-purple-50/60 border border-purple-100 rounded-xl p-6 flex flex-col justify-between">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">
                      {selectedFile}
                    </p>
                    <p className="text-xs text-slate-500">12.5 KB</p>
                  </div>
                </div>
                <div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-xs font-semibold text-blue-900 hover:underline"
                  >
                    Cambiar archivo
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ================= SECCIÓN 2: ASIGNAR COLUMNAS ================= */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              2. Asignar columnas
            </h2>
            <p className="text-xs text-slate-500">
              Relaciona cada columna del archivo con los datos correspondientes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {/* Columna Nombre */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Nombre
              </label>
              <div className="flex items-center space-x-1 border border-slate-300 rounded-lg bg-white px-2 py-1.5 shadow-sm">
                <GripVertical className="w-4 h-4 text-slate-400 cursor-grab" />
                <select className="w-full bg-transparent text-xs text-slate-700 focus:outline-none cursor-pointer">
                  <option>Nombre completo</option>
                </select>
              </div>
            </div>

            {/* Columna Documento */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Documento
              </label>
              <div className="flex items-center space-x-1 border border-slate-300 rounded-lg bg-white px-2 py-1.5 shadow-sm">
                <GripVertical className="w-4 h-4 text-slate-400 cursor-grab" />
                <select className="w-full bg-transparent text-xs text-slate-700 focus:outline-none cursor-pointer">
                  <option>N° Documento</option>
                </select>
              </div>
            </div>

            {/* Columna Tipo de documento */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Tipo de documento
              </label>
              <div className="flex items-center space-x-1 border border-slate-300 rounded-lg bg-white px-2 py-1.5 shadow-sm">
                <select className="w-full bg-transparent text-xs text-slate-700 focus:outline-none cursor-pointer px-1">
                  <option>Tipo doc.</option>
                </select>
              </div>
            </div>

            {/* Columna Correo */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Correo
              </label>
              <div className="flex items-center space-x-1 border border-slate-300 rounded-lg bg-white px-2 py-1.5 shadow-sm">
                <select className="w-full bg-transparent text-xs text-slate-700 focus:outline-none cursor-pointer px-1">
                  <option>Correo electrónico</option>
                </select>
              </div>
            </div>

            {/* Columna Consultorio */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Consultorio
              </label>
              <div className="flex items-center space-x-1 border border-slate-300 rounded-lg bg-white px-2 py-1.5 shadow-sm">
                <select className="w-full bg-transparent text-xs text-slate-700 focus:outline-none cursor-pointer px-1">
                  <option>Consultorio</option>
                </select>
              </div>
            </div>
          </div>

          {/* Banner informativo */}
          <div className="bg-blue-50/70 border border-blue-100 rounded-lg p-3 flex items-center space-x-3 text-xs text-slate-600">
            <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span>
              Si alguna columna no corresponde, selecciónala manualmente. Puedes
              arrastrar las opciones para cambiar su orden.
            </span>
          </div>
        </section>

        {/* ================= SECCIÓN 3: VISTA PREVIA DE DATOS ================= */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h2 className="text-lg font-bold text-slate-900">
                3. Vista previa de datos
              </h2>
              <span className="bg-slate-200 text-slate-700 text-xs px-2.5 py-0.5 rounded-full font-medium">
                10 registros detectados
              </span>
            </div>
            <button className="flex items-center space-x-1.5 border border-slate-300 bg-white px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-900 hover:bg-slate-50 transition-colors shadow-sm">
              <Pencil className="w-3.5 h-3.5" />
              <span>Editar datos</span>
            </button>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-indigo-950 text-white text-xs font-semibold">
                  <th className="p-3 pl-4">Nombre</th>
                  <th className="p-3">Documento</th>
                  <th className="p-3">Tipo de documento</th>
                  <th className="p-3">Correo</th>
                  <th className="p-3">Consultorio</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100 text-xs">
                {students.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    {/* Nombre */}
                    <td className="p-2 pl-4">
                      <div className="flex items-center justify-between border border-slate-200 rounded-md px-2.5 py-1.5 bg-white">
                        <span className="text-slate-700">{student.nombre}</span>
                        <Pencil className="w-3 h-3 text-slate-400" />
                      </div>
                    </td>

                    {/* Documento */}
                    <td className="p-2">
                      <div className="flex items-center justify-between border border-slate-200 rounded-md px-2.5 py-1.5 bg-white">
                        <span className="text-slate-700">
                          {student.documento}
                        </span>
                        <Pencil className="w-3 h-3 text-slate-400" />
                      </div>
                    </td>

                    {/* Tipo Doc */}
                    <td className="p-2">
                      <div className="flex items-center justify-between border border-slate-200 rounded-md px-2.5 py-1.5 bg-white">
                        <span className="text-slate-700">
                          {student.tipoDoc}
                        </span>
                        <Pencil className="w-3 h-3 text-slate-400" />
                      </div>
                    </td>

                    {/* Correo */}
                    <td className="p-2">
                      <div className="flex items-center justify-between border border-slate-200 rounded-md px-2.5 py-1.5 bg-white">
                        <span className="text-slate-700 truncate max-w-[200px]">
                          {student.correo}
                        </span>
                        <Pencil className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      </div>
                    </td>

                    {/* Consultorio */}
                    <td className="p-2 pr-4">
                      <div className="flex items-center justify-between border border-slate-200 rounded-md px-2.5 py-1.5 bg-white">
                        <span className="text-slate-700">
                          {student.consultorio}
                        </span>
                        <Pencil className="w-3 h-3 text-slate-400" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ================= BOTONES DE ACCIÓN INFERIORES ================= */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <button className="px-5 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors">
            Cancelar
          </button>

          <button className="flex items-center space-x-2 bg-amber-400 hover:bg-amber-500 text-slate-900 px-5 py-2.5 rounded-lg text-xs font-bold transition-colors shadow-sm">
            <span>Confirmar y guardar estudiantes</span>
            <CheckCircle2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
