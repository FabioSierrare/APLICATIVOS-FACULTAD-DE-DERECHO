"use client";
import React, { useState, useEffect } from "react";
import { postData } from "@/components/FetchPost";
import useFetchData from "@/components/FetchData";
import NavBar from "@/components/NavBar";
import ComponentLink from "@/components/ComponentLink";
import { usePathname, useRouter } from "next/navigation";
import { User, LogIn } from "lucide-react";
export default function RegistroAsesores() {
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [Form, setForm] = useState({
    Nombre: "",
    Documento: "",
    TipoDocumentoId: 0,
    Correo: "",
    Contrasena: "",
    RolId: 3,
  });

  const numericFields = ["TipoDocumentoId"];

  const router = useRouter();

  const { data: tipoDocumento } = useFetchData(
    "/api/TiposDocumento/GetTiposDocumento"
  );

  // 🔹 handler para objetos anidados
  // handler para objetos anidados con validación
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "Documento" && !/^[0-9]*$/.test(value)) {
      return; // ❌ bloquea todo lo que no sea número
    }

    if (name === "Nombre" && !/^[a-zA-Z\s]*$/.test(value)) {
      return; // ❌ bloquea todo lo que no sea letra o espacio
    }

    if (name === "Documento") {
      setForm((prev) => ({
        ...prev,
        ["Contrasena"]: value,
      }));
    }

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "nombre"
          ? value.toUpperCase()
          : numericFields.includes(name)
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // evita reload

    setEnviando(true);
    setMensaje(null);

    try {
      await postData("/api/Usuarios/PostUsuarios", Form);

      setMensaje({
        tipo: "ok",
        texto: "Asesor registrado correctamente",
      });

      setForm({
        Nombre: "",
        Documento: "",
        TipoDocumentoId: 0,
        Correo: "",
        Contrasena: "",
        RolId: 3,
      });
    } catch (error) {
      setMensaje({
        tipo: "error",
        texto: "Error al registrar el asesor",
      });
    } finally {
      setEnviando(false);
    }
  };

  // 🔹 enviar datos
  if (!tipoDocumento) {
    return (
      <p className="text-center mt-10 text-primary">Cargando formulario...</p>
    );
  }

  return (
    <div>
      <div className="min-h-screen w-full flex items-center justify-center p-4">
        <div className="w-full max-w-3xl">
          <div className="bg-white shadow-lg rounded-2xl border border-gray-100">
            <div className="p-6 sm:p-8">
              <header className="mb-6 flex flex-col">
                <div className="w-15 mx-auto">
                  <img src="/img/Logo.png" alt="" />
                </div>
                <p className="font-semibold text-center mb-5">
                  Universidad Colegio Mayor <br />
                  de Cundinamarca
                </p>
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
                    Registro de asesores
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    Completa la información para continuar.{" "}
                    <span className="text-red-500">*</span> Campos obligatorios.
                  </p>
                </div>
              </header>

              <form
                onSubmit={handleSubmit}
                noValidate
                className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
              >
                {/* Nombre */}
                <div className="col-span-1">
                  <label
                    htmlFor="nombre"
                    className="block text-sm font-medium text-gray-800"
                  >
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="nombre"
                    name="Nombre"
                    type="text"
                    required
                    value={Form.Nombre}
                    onChange={handleChange}
                    autoCapitalize="none"
                    placeholder="Nombre completo"
                    className="mt-1 block w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-4 focus:ring-gray-200"
                  />
                </div>

                {/* Documento */}
                <div className="col-span-1">
                  <label
                    htmlFor="documento"
                    className="block text-sm font-medium text-gray-800"
                  >
                    Documento <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="documento"
                    name="Documento"
                    type="text"
                    inputMode="numeric"
                    autoCapitalize="none"
                    required
                    value={Form.Documento}
                    onChange={handleChange}
                    placeholder="Número de documento"
                    className="mt-1 block w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-4 focus:ring-gray-200"
                  />
                </div>

                {/* Tipo de documento */}
                <div className="col-span-1">
                  <label
                    htmlFor="tipoDocumento"
                    className="block text-sm font-medium text-gray-800"
                  >
                    Tipo de documento <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="tipoDocumento"
                    name="TipoDocumentoId"
                    required
                    value={Form.TipoDocumentoId}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:outline-none focus:ring-4 focus:ring-gray-200"
                  >
                    <option value={0} disabled>
                      Selecciona una opción
                    </option>
                    {tipoDocumento
                      .filter((t) => t.nombre != "Tarjeta de Identidad")
                      .map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.nombre}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Correo */}
                <div className="col-span-1">
                  <label
                    htmlFor="correo"
                    className="block text-sm font-medium text-gray-800"
                  >
                    Correo <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="correo"
                    name="Correo"
                    type="email"
                    required
                    autoCapitalize="none"
                    value={Form.Correo}
                    onChange={handleChange}
                    placeholder="tucorreo@universidadmayor.edu.co"
                    className="mt-1 block w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-4 focus:ring-gray-200"
                  />
                </div>

                {/* Mensaje */}
                <div className="md:col-span-2">
                  {mensaje && (
                    <div
                      role="status"
                      className={`mt-2 rounded-xl border px-3 py-2 text-sm ${
                        mensaje.tipo === "ok"
                          ? "border-green-200 bg-green-50 text-green-800"
                          : "border-red-200 bg-red-50 text-red-800"
                      }`}
                    >
                      {mensaje.texto}
                    </div>
                  )}
                </div>

                {/* Acciones */}
                <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
                  <button
                    type="reset"
                    onClick={() => handleSubmit}
                    className="cursor-pointer rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Limpiar
                  </button>
                  <button
                    type="submit"
                    disabled={enviando}
                    className="cursor-pointer rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-black disabled:opacity-60"
                  >
                    {enviando ? "Enviando…" : "Guardar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
