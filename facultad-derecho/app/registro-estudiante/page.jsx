"use client";
import React, { useState, useEffect } from "react";
import { postData } from "@/components/FetchPost";
import NavBar from "@/components/NavBar";
import ComponentLink from "@/components/ComponentLink";
import { usePathname } from "next/navigation";
export const runtime = "edge";
import { User, LogIn } from "lucide-react";
import { useRouter } from "next/router";
export default function RegistroFormulario() {
  const [form, setForm] = useState({
    Usuarios: {
      Nombre: "",
      Documento: "",
      TipoDocumentoId: 0,
      Correo: "",
      Contrasena: "",
      RolId: 2,
    },
    Consultorio: {
      UsuarioId: 0,
      ConsultorioId: 0,
    },
  });

  const [mostrarPass, setMostrarPass] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const pathname = usePathname();
  const [consultorio, setConsultorio] = useState([]);
  const [tipoDocumento, setTipoDocumento] = useState([]);
  const router = useRouter();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [consultoriosRes, tiposDocRes] = await Promise.all([
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/Consultorios/GetConsultorios`
          ).then((res) => res.json()),
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/TiposDocumento/GetTiposDocumento`
          ).then((res) => res.json()),
        ]);

        setConsultorio(consultoriosRes);
        setTipoDocumento(tiposDocRes);
      } catch (err) {
        console.error("Error cargando datos", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const numericFields = ["ConsultorioId", "TipoDocumentoId"];

  // 🔹 handler para objetos anidados
  const handleChange = (e, section) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [name]: numericFields.includes(name) ? Number(value) : value,
      },
    }));
  };

  // 🔹 enviar datos
  async function handleSubmit(e) {
    e.preventDefault();
    setMensaje(null);

    // Validación simple
    if (
      !form.Usuarios.Nombre ||
      !form.Usuarios.Documento ||
      !form.Usuarios.TipoDocumentoId ||
      !form.Usuarios.Correo ||
      !form.Usuarios.Contrasena ||
      !form.Consultorio.ConsultorioId
    ) {
      setMensaje({
        tipo: "error",
        texto: "Por favor completa todos los campos requeridos.",
      });
      return;
    }

    try {
      setEnviando(true);

      const respuesta = await postData(
        "/api/Usuarios/PostUsuarioEstudiante",
        form
      );

      if (respuesta) {
        setMensaje({ tipo: "ok", texto: "Datos guardados correctamente." });
        // 🔹 reset limpio
        setForm({
          Usuarios: {
            Nombre: "",
            Documento: "",
            TipoDocumentoId: 0,
            Correo: "",
            Contrasena: "",
            RolId: 2,
          },
          Consultorio: {
            UsuarioId: 0,
            ConsultorioId: 0,
          },
        });
        router.push("/");
      } else {
        setMensaje({
          tipo: "error",
          texto: respuesta?.message || "Error al guardar los datos.",
        });
      }
    } catch (err) {
      setMensaje({ tipo: "error", texto: err?.message || "Error inesperado" });
    } finally {
      setEnviando(false);
    }
  }

  if (!consultorio || !tipoDocumento) {
    return (
      <p className="text-center mt-10 text-primary">Cargando formulario...</p>
    );
  }

  return (
    <div>
      <NavBar>
        <ComponentLink
          label="Iniciar sesión"
          href="/"
          isActive={pathname === "/"}
          Icon={LogIn} // icono de iniciar sesión
        />
        <ComponentLink
          label="Registrarse"
          href="/registro-estudiante"
          isActive={pathname === "/registro-estudiante"}
          Icon={User} // icono de usuario/registro
        />
      </NavBar>
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
                    Formulario de registro
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
                    value={form.Usuarios.Nombre}
                    onChange={(e) => handleChange(e, "Usuarios")}
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
                    required
                    value={form.Usuarios.Documento}
                    onChange={(e) => handleChange(e, "Usuarios")}
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
                    value={form.Usuarios.TipoDocumentoId}
                    onChange={(e) => handleChange(e, "Usuarios")}
                    className="mt-1 block w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:outline-none focus:ring-4 focus:ring-gray-200"
                  >
                    <option value={0} disabled>
                      Selecciona una opción
                    </option>
                    {tipoDocumento.map((t) => (
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
                    value={form.Usuarios.Correo}
                    onChange={(e) => handleChange(e, "Usuarios")}
                    placeholder="tucorreo@dominio.com"
                    className="mt-1 block w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-4 focus:ring-gray-200"
                  />
                </div>

                {/* Contraseña */}
                <div className="col-span-1">
                  <label
                    htmlFor="contrasena"
                    className="block text-sm font-medium text-gray-800"
                  >
                    Contraseña <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="contrasena"
                      name="Contrasena"
                      type={mostrarPass ? "text" : "password"}
                      required
                      minLength={8}
                      value={form.Usuarios.Contrasena}
                      onChange={(e) => handleChange(e, "Usuarios")}
                      placeholder="Mínimo 8 caracteres"
                      className="block w-full rounded-xl border border-gray-300 bg-white px-3 py-2 pr-12 text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-4 focus:ring-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarPass((v) => !v)}
                      className="absolute inset-y-0 right-0 px-3 text-sm text-gray-600 hover:text-gray-900"
                    >
                      {mostrarPass ? "Ocultar" : "Mostrar"}
                    </button>
                  </div>
                </div>

                {/* Consultorio */}
                <div className="col-span-1">
                  <label
                    htmlFor="consultorio"
                    className="block text-sm font-medium text-gray-800"
                  >
                    Consultorio <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="consultorio"
                    name="ConsultorioId"
                    required
                    value={form.Consultorio.ConsultorioId}
                    onChange={(e) => handleChange(e, "Consultorio")}
                    className="mt-1 block w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:outline-none focus:ring-4 focus:ring-gray-200"
                  >
                    <option value={0} disabled>
                      Selecciona un consultorio
                    </option>
                    {consultorio.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
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
                    onClick={() =>
                      setForm({
                        Usuarios: {
                          Nombre: "",
                          Documento: "",
                          TipoDocumentoId: 0,
                          Correo: "",
                          Contrasena: "",
                          RolId: 2,
                        },
                        Consultorio: {
                          UsuarioId: 0,
                          ConsultorioId: 0,
                        },
                      })
                    }
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
