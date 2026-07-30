"use client";

import SelectedFileExcel from "@/components/newstudent";
import { button } from "@heroui/theme";
import { postData } from "@/components/FetchPost";
import { useState } from "react";
import * as XLSX from "xlsx";

export default function NewUser() {
  const [registro, setRegistro] = useState({ data: [], hashes: [] });
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);

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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/${"api/Gemi/GetLista".replace(/^\/+/, "")}`,
        {
          method: "POST",
          headers,
          body: formData,
        }
      );

      console.log(response)

      const rawResponse = await response.text();
      let data;
      try {
        data = JSON.parse(rawResponse);
      } catch {
        data = rawResponse;
      }

      if (!response.ok) {
        throw new Error(
          typeof data === "string"
            ? data
            : data?.message || data?.error || `Error: ${response.status}`
        );
      }

      console.log("Respuesta API GetLista:", data);
      alert("Prueba de la API GetLista enviada correctamente");
    } catch (error) {
      console.error("Error al enviar el archivo a la API GetLista:", error);
      alert("No se pudo enviar el archivo a la API GetLista");
    }
  };

  const head = [
    "Tipo de Documento",
    "Identificación",
    "Nombre",
    "Correo Institucional",
    "Repitente",
  ];

  const DocumentoId = {
    CC: 1,
    TI: 2,
    CE: 3,
    PP: 4,
  };

  const procesar = async (file) => {
    setArchivoSeleccionado(file);
    await enviarArchivoAGemi(file);

    const nombre = file.name.toLowerCase();
    const esExcel = nombre.endsWith(".xlsx") || nombre.endsWith(".xls");

    if (!esExcel) {
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);

      // 🔐 HASH del archivo para evitar duplicados
      const hash = data.reduce((a, b) => (a + b) % 1000000007, 0);

      // 🚫 Si el hash ya existe → NO procesar
      if (registro.hashes.includes(hash)) {
        alert("⚠️ Este listado ya fue cargado anteriormente.");
        return;
      }

      // ⬇️ Procesar Excel normalmente
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];

      const json = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        range: 3,
      });

      const headers = json[0];
      const rows = json.slice(1);

      if (JSON.stringify(head) !== JSON.stringify(headers)) {
        alert(
          "El documento ingresado no tiene el formato adecuado para el registro de los estudiantes"
        );
        return;
      }

      const consultorio = parseInt(sheet["D3"].v.slice(-1));

      const finalJson = rows.map((row) =>
        Object.fromEntries(headers.map((h, i) => [h, row[i]]))
      );

      const js = finalJson.map((j) => {
        const dctId = DocumentoId[j["Tipo de Documento"]];
        return {
          Usuarios: {
            Nombre: j.Nombre,
            Documento: j.Identificación,
            TipoDocumentoId: dctId,
            Correo: j["Correo Institucional"],
            Contrasena: j.Identificación,
            RolId: 2,
          },
          Consultorio: {
            UsuarioId: 0,
            ConsultorioId: consultorio,
          },
        };
      });

      // Guardar datos + hash
      setRegistro((prev) => ({
        data: [...prev.data, ...js],
        hashes: [...prev.hashes, hash],
      }));
    };

    reader.readAsArrayBuffer(file);
  };

  const [cantidad, setCantidad] = useState(1);
  const aumentar = (e) => {
    e.preventDefault();
    setCantidad(cantidad + 1);
  };

  //Enviar datos constante que maneja la logica del post

    const Submit = async (e) => {
      e.preventDefault();

      if (archivoSeleccionado) {
        await enviarArchivoAGemi(archivoSeleccionado);
      }

      
    };

    console.log(archivoSeleccionado)
  return (
    <div className="py-10 px-5 bg-white rounded-2xl">
      <div className="p-5 bg-[linear-gradient(143deg,_rgba(129,33,255,1)_0%,_rgba(46,11,36,1)_50%,_rgba(160,40,235,1)_86%)] rounded-xl">
        <h2 className="text-white flex items-center gap-2 text-xl mb-10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 640 640"
            className="w-5 h-5"
            fill="currentColor"
          >
            <path d="M320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576zM296 408L296 344L232 344C218.7 344 208 333.3 208 320C208 306.7 218.7 296 232 296L296 296L296 232C296 218.7 306.7 208 320 208C333.3 208 344 218.7 344 232L344 296L408 296C421.3 296 432 306.7 432 320C432 333.3 421.3 344 408 344L344 344L344 408C344 421.3 333.3 432 320 432C306.7 432 296 421.3 296 408z" />
          </svg>
          Nuevos estudiantes
        </h2>

        <form action="">
          {[...Array(cantidad)].map((_, i) => (
            <SelectedFileExcel onFileSelect={procesar} key={i} />
          ))}

          <div className="flex flex-row justify-end items-center gap-3">
            <p className="text-white">Agregar más listados</p>

            <button
              className="bg-white text-black w-10 rounded-4xl p-1 cursor-pointer"
              onClick={aumentar}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                <path d="M352 128C352 110.3 337.7 96 320 96C302.3 96 288 110.3 288 128L288 288L128 288C110.3 288 96 302.3 96 320C96 337.7 110.3 352 128 352L288 352L288 512C288 529.7 302.3 544 320 544C337.7 544 352 529.7 352 512L352 352L512 352C529.7 352 544 337.7 544 320C544 302.3 529.7 288 512 288L352 288L352 128z" />
              </svg>
            </button>
          </div>

          <button
        className={`w-full flex justify-center
              ${
                registro.data.length > 0
                  ? "bg-[linear-gradient(143deg,_rgba(129,33,255,1)_0%,_rgba(160,40,235,1)_38%,_rgba(72,34,87,1)_73%)] text-white p-3 col-span-full mt-7 rounded-3xl hover:bg-white/90 cursor-pointer"
                  : "bg-secundary-text text-white p-3 col-span-full mt-7 rounded-3xl cursor-not-allowed"
              }
              `}
        onClick={Submit}
      >
        Añadir
      </button>
        </form>
      </div>
    </div>
  );
}
