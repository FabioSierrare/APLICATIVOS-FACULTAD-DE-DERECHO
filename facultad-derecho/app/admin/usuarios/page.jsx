"use client";

import React, { useRef, useState } from "react";
import * as XLSX from "xlsx";
import {
  Upload,
  FileSpreadsheet,
  GripVertical,
  Info,
  Pencil,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { ListasAdd } from "@/Model/ListasAdd";
import LoadingProcessingPage from "@/components/LoadingProcessingPage";
import getAuthHeaders from "@/components/Authorization";

const COLUMN_FIELDS = [
  { key: "nombre", label: "Nombre" },
  { key: "documento", label: "Documento" },
  { key: "tipoDocumento", label: "Tipo de documento" },
  { key: "correo", label: "Correo" },
  { key: "consultorio", label: "Consultorio" },
];

const formatFileSize = (size) => {
  if (!size) return "0 KB";
  const kb = size / 1024;
  return kb < 1024 ? `${kb.toFixed(1)} KB` : `${(kb / 1024).toFixed(1)} MB`;
};

const normalizeValue = (value) => {
  if (value === null || value === undefined) return "";
  return String(value).toString().trim();
};

const extractRows = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.result)) return payload.result;
  if (Array.isArray(payload?.lista)) return payload.lista;
  if (Array.isArray(payload?.estudiantes)) return payload.estudiantes;
  if (Array.isArray(payload?.items)) return payload.items;

  if (payload && typeof payload === "object") {
    for (const key of ["data", "rows", "result", "lista", "estudiantes", "items"]) {
      if (Array.isArray(payload[key])) return payload[key];
    }
  }

  return [];
};

const buildStudentsFromRows = (rows, mapping) => {
  if (!rows?.length) return [];

  return rows.map((row, index) => {
    const normalizedRow = row && typeof row === "object" && !Array.isArray(row)
      ? row
      : {};

    return {
      id: index + 1,
      nombre: normalizeValue(normalizedRow[mapping.nombre] ?? ""),
      documento: normalizeValue(normalizedRow[mapping.documento] ?? ""),
      tipoDoc: normalizeValue(normalizedRow[mapping.tipoDocumento] ?? ""),
      correo: normalizeValue(normalizedRow[mapping.correo] ?? ""),
      consultorio: normalizeValue(normalizedRow[mapping.consultorio] ?? ""),
    };
  });
};

export default function ImportStudentsPage() {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [sheetHeaders, setSheetHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [mapping, setMapping] = useState({ ...ListasAdd });
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleMappingChange = (field, value) => {
    const nextMapping = { ...mapping, [field]: value };
    setMapping(nextMapping);
    setStudents(buildStudentsFromRows(rows, nextMapping));
  };

  const updateStudentField = (studentId, field, value) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === studentId ? { ...student, [field]: value } : student
      )
    );
  };

  const removeStudent = (studentId) => {
    setStudents((prev) => prev.filter((student) => student.id !== studentId));
  };

  const hasIncompleteStudents = () =>
    students.some((student) => {
      const values = [student.nombre, student.documento, student.tipoDoc, student.correo, student.consultorio];
      return values.some((value) => normalizeValue(value) === "");
    });

  const guardarEstudiantes = async () => {
    if (!students.length || hasIncompleteStudents()) {
      setError("Completa todos los campos antes de guardar");
      return;
    }

    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers = {
        "X-App-Service": "MiSecretoPro_2026",
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const payload = students.map((student) => ({
        nombre: student.nombre,
        documento: student.documento,
        tipoDocumento: student.tipoDoc,
        correo: student.correo,
        consultorio: student.consultorio,
      }));

      const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
      const endpoint = apiBaseUrl
        ? `${apiBaseUrl}/api/Usuarios/PostEstudiantesListado`
        : "/api/Usuarios/PostEstudiantesListado";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const rawResponse = await response.text();
      let parsedResponse = rawResponse;
      try {
        parsedResponse = JSON.parse(rawResponse);
      } catch {
        parsedResponse = rawResponse;
      }

      if (!response.ok) {
        throw new Error(
          typeof parsedResponse === "string"
            ? parsedResponse
            : parsedResponse?.message || parsedResponse?.error || `Error: ${response.status}`
        );
      }

      setError("");
      alert("Estudiantes guardados correctamente");
    } catch (error) {
      console.error("Error al guardar los estudiantes:", error);
      setError(error.message || "No se pudo guardar la lista de estudiantes");
    }
  };

  const enviarArchivoAGemi = async (file) => {
    if (!file) return;

    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const headers = {
      "X-App-Service": "MiSecretoPro_2026",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("archivo", file);

    try {
      const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
      const endpoint = apiBaseUrl ? `${apiBaseUrl}/api/Gemi/GetLista` : "/api/Gemi/GetLista";

      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        body: formData,
      });

      const rawResponse = await response.text();
      let payload = rawResponse;
      try {
        payload = JSON.parse(rawResponse);
      } catch {
        payload = rawResponse;
      }

      if (!response.ok) {
        throw new Error(
          typeof payload === "string"
            ? payload
            : payload?.message || payload?.error || `Error: ${response.status}`
        );
      }

      const extractedRows = extractRows(payload);
      let dataRows = extractedRows;

      if (!dataRows.length) {
        const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        dataRows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      }

      const columnHeaders = dataRows?.[0]
        ? Object.keys(dataRows[0]).filter((key) => key !== "__rowNum__")
        : [];

      const matchingHeaders = columnHeaders.length ? columnHeaders : [];
      const defaultMapping = {
        ...ListasAdd,
        nombre: matchingHeaders.find((header) => /nombre|full/i.test(header)) || matchingHeaders[0] || "",
        documento: matchingHeaders.find((header) => /document|doc/i.test(header)) || matchingHeaders[1] || "",
        tipoDocumento: matchingHeaders.find((header) => /tipoDocumento/i.test(header)) || matchingHeaders[2] || "",
        correo: matchingHeaders.find((header) => /correo|email/i.test(header)) || matchingHeaders[3] || "",
        consultorio: matchingHeaders.find((header) => /consultorio|sede|oficina/i.test(header)) || matchingHeaders[4] || "",
      };

      setSheetHeaders(matchingHeaders);
      setRows(dataRows);
      setMapping(defaultMapping);
      setStudents(buildStudentsFromRows(dataRows, defaultMapping));
      setError("");
    } catch (error) {
      console.error("Error al enviar el archivo a la API GetLista:", error);
      setError(error.message || "No se pudo enviar el archivo a la API GetLista");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelection = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isAllowedFile = [".xlsx", ".xls", ".csv", ".pdf"].some((extension) =>
      file.name.toLowerCase().endsWith(extension)
    );

    if (!isAllowedFile) {
      setError("Solo se admiten archivos .xlsx, .xls, .csv o .pdf");
      return;
    }

    setSelectedFile(file);
    setError("");
    setIsLoading(true);
    await enviarArchivoAGemi(file);
  };

  if (isLoading) {
    return <LoadingProcessingPage/>;
  }

  console.log(students)

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="flex items-center justify-between max-w-4xl mx-auto px-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-blue-900 text-white flex items-center justify-center font-semibold text-sm">
              1
            </div>
            <div>
              <p className="font-semibold text-sm text-slate-900">Subir archivo</p>
              <p className="text-xs text-slate-500">
                Selecciona el archivo con los estudiantes
              </p>
            </div>
          </div>

          <div className="h-0.5 flex-1 bg-slate-300 mx-4" />

          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-blue-900 text-white flex items-center justify-center font-semibold text-sm">
              2
            </div>
            <div>
              <p className="font-semibold text-sm text-slate-900">Asignar columnas</p>
              <p className="text-xs text-slate-500">
                Relaciona las columnas del archivo
              </p>
            </div>
          </div>

          <div className="h-0.5 flex-1 bg-slate-300 mx-4" />

          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-slate-300 text-slate-600 flex items-center justify-center font-semibold text-sm">
              3
            </div>
            <div>
              <p className="font-semibold text-sm text-slate-500">Revisar y confirmar</p>
              <p className="text-xs text-slate-400">
                Verifica los datos antes de guardar
              </p>
            </div>
          </div>
        </div>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">1. Subir archivo</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50/50 hover:bg-slate-100/50 transition-colors flex flex-col items-center justify-center">
              <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <p className="font-semibold text-sm text-slate-800">Selecciona un archivo</p>
              <p className="text-xs text-slate-500 mb-4">
                Formatos permitidos: .csv, .xlsx, .xls
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls, .pdf"
                className="hidden"
                onChange={handleFileSelection}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-900 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-blue-950 transition-colors"
              >
                {isLoading ? "Procesando..." : "Seleccionar archivo"}
              </button>
            </div>

            {selectedFile && (
              <div className="bg-purple-50/60 border border-purple-100 rounded-xl p-6 flex flex-col justify-between">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{selectedFile.name}</p>
                    <p className="text-xs text-slate-500">{formatFileSize(selectedFile.size)}</p>
                  </div>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setSheetHeaders([]);
                      setRows([]);
                      setStudents([]);
                      setMapping({ ...ListasAdd });
                      setError("");
                    }}
                    className="text-xs font-semibold text-blue-900 hover:underline"
                  >
                    Cambiar archivo
                  </button>
                </div>
              </div>
            )}
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">2. Asignar columnas</h2>
            <p className="text-xs text-slate-500">
              Relaciona cada columna del archivo con los datos correspondientes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {COLUMN_FIELDS.map(({ key, label }) => (
              <div key={key} className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">{label}</label>
                <div className="flex items-center space-x-1 border border-slate-300 rounded-lg bg-white px-2 py-1.5 shadow-sm">
                  {key === "nombre" ? (
                    <GripVertical className="w-4 h-4 text-slate-400 cursor-grab" />
                  ) : null}
                  <select
                    value={mapping[key] ?? ""}
                    onChange={(event) => handleMappingChange(key, event.target.value)}
                    className="w-full bg-transparent text-xs text-slate-700 focus:outline-none cursor-pointer px-1"
                  >
                    <option value="">Selecciona una columna</option>
                    {sheetHeaders.map((header) => (
                      <option key={header} value={header}>
                        {header}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-blue-50/70 border border-blue-100 rounded-lg p-3 flex items-center space-x-3 text-xs text-slate-600">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              Si alguna columna no corresponde, selecciónala manualmente. El cambio se refleja inmediatamente en la vista previa.
            </span>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h2 className="text-lg font-bold text-slate-900">3. Vista previa de datos</h2>
              <span className="bg-slate-200 text-slate-700 text-xs px-2.5 py-0.5 rounded-full font-medium">
                {students.length} registros detectados
              </span>
            </div>
            <button className="flex items-center space-x-1.5 border border-slate-300 bg-white px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-900 hover:bg-slate-50 transition-colors shadow-sm">
              <Pencil className="w-3.5 h-3.5" />
              <span>Editar datos</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-indigo-950 text-white text-xs font-semibold">
                  <th className="p-3 pl-4">Nombre</th>
                  <th className="p-3">Documento</th>
                  <th className="p-3">Tipo de documento</th>
                  <th className="p-3">Correo</th>
                  <th className="p-3">Consultorio</th>
                  <th className="p-3 pr-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100 text-xs">
                {students.map((student) => {
                  const isIncomplete = [student.nombre, student.documento, student.tipoDoc, student.correo, student.consultorio].some(
                    (value) => normalizeValue(value) === ""
                  );

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-2 pl-4">
                        <input
                          value={student.nombre}
                          onChange={(event) => updateStudentField(student.id, "nombre", event.target.value)}
                          className={`w-full border rounded-md px-2.5 py-1.5 bg-white ${isIncomplete && !student.nombre ? "border-red-500" : "border-slate-200"}`}
                        />
                      </td>

                      <td className="p-2">
                        <input
                          value={student.documento}
                          onChange={(event) => updateStudentField(student.id, "documento", event.target.value)}
                          className={`w-full border rounded-md px-2.5 py-1.5 bg-white ${isIncomplete && !student.documento ? "border-red-500" : "border-slate-200"}`}
                        />
                      </td>

                      <td className="p-2">
                        <input
                          value={student.tipoDoc}
                          onChange={(event) => updateStudentField(student.id, "tipoDoc", event.target.value)}
                          className={`w-full border rounded-md px-2.5 py-1.5 bg-white ${isIncomplete && !student.tipoDoc ? "border-red-500" : "border-slate-200"}`}
                        />
                      </td>

                      <td className="p-2">
                        <input
                          value={student.correo}
                          onChange={(event) => updateStudentField(student.id, "correo", event.target.value)}
                          className={`w-full border rounded-md px-2.5 py-1.5 bg-white ${isIncomplete && !student.correo ? "border-red-500" : "border-slate-200"}`}
                        />
                      </td>

                      <td className="p-2">
                        <input
                          value={student.consultorio}
                          onChange={(event) => updateStudentField(student.id, "consultorio", event.target.value)}
                          className={`w-full border rounded-md px-2.5 py-1.5 bg-white ${isIncomplete && !student.consultorio ? "border-red-500" : "border-slate-200"}`}
                        />
                      </td>

                      <td className="p-2 pr-4 text-right">
                        <button
                          type="button"
                          onClick={() => removeStudent(student.id)}
                          className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2 py-1 text-red-600 hover:bg-red-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <button className="px-5 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors">
            Cancelar
          </button>

          <button
            type="button"
            onClick={guardarEstudiantes}
            disabled={students.length === 0 || hasIncompleteStudents()}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-colors shadow-sm ${students.length === 0 || hasIncompleteStudents()
              ? "bg-slate-300 text-slate-500 cursor-not-allowed"
              : "bg-amber-400 hover:bg-amber-500 text-slate-900"
            }`}
          >
            <span>Confirmar y guardar estudiantes</span>
            <CheckCircle2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
