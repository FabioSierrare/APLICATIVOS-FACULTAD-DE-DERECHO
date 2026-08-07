"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useFetchData from "@/components/FetchData";
import { postData } from "@/components/FetchPost";

export default function TurnosTable() {
  const [search, setSearch] = useState("");
  const [loadingEmail, setLoadingEmail] = useState(null); // Guarda el ID del usuario en envío

  // Estado para la alerta visual de la UI
  const [alertInfo, setAlertInfo] = useState(null);

  const showAlert = (type, message) => {
    setAlertInfo({ type, message });
    setTimeout(() => {
      setAlertInfo(null);
    }, 4000);
  };

  const { data: Usuarios, loading } = useFetchData("/api/Usuarios/GetUsuarios");
  const { data: TipoDocumento, lod } = useFetchData(
    "/api/TiposDocumento/GetTiposDocumento"
  );
  const { data: Consultorios, loadin } = useFetchData(
    "/api/UsuarioConsultorios/GetUsuarioConsultorio"
  );

  const { data: Turnos, lo } = useFetchData("/api/Turnos/GetTurnos");
  const { data: Calendario } = useFetchData("/api/Calendarios/GetCalendarios");

  if (loading || lod || loadin || lo) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          <h1 className="text-white font-medium">Cargando...</h1>
        </div>
      </div>
    );
  }

  if (!Usuarios || !TipoDocumento || !Consultorios || !Turnos || !Calendario) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <h1 className="text-white/80 font-light">Esperando datos...</h1>
      </div>
    );
  }

  const ultimoCalendario = Calendario[Calendario.length - 1];

  const usuarios = Usuarios.map((u) => {
    const tipoDoc = TipoDocumento.find((t) => t.id === u.tipoDocumentoId);
    const consu = Consultorios.find((t) => t.usuarioId === u.id);

    const turnosUsuario = Turnos.filter(
      (t) => t.usuarioId === u.id && t.calendarioId === ultimoCalendario.id
    );

    return {
      ...u,
      tipoDocumento: tipoDoc ? tipoDoc.nombre : "Sin definir",
      consultorio: consu ? consu.consultorioId : "Sin definir",
      turnos: turnosUsuario,
    };
  }).filter((u) => u.rolId === 2);

  const filtered = usuarios.filter((u) =>
    [u.nombre, u.correo, u.documento]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const meses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  function formatearFecha(fechaString) {
    const fecha = new Date(fechaString);
    if (isNaN(fecha)) return fechaString;
    const dia = fecha.getDate();
    const mes = meses[fecha.getMonth()];
    const año = fecha.getFullYear();
    return `${dia} de ${mes} de ${año}`;
  }

  const handleSendEmail = async (user) => {
    if (user.turnos.length === 0) {
      showAlert("warning", "Este usuario no tiene turnos que notificar");
      return;
    }

    try {
      setLoadingEmail(user.id);
      const correo = {
        para: user.correo,
        asunto: "Confirmación de turnos",
        cuerpo: `
    <h2>Hola ${user.nombre},</h2>
    <p>Tus turnos han sido confirmados con éxito ✅</p>
    
    <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; max-width: 600px; margin: 20px 0;">
      <thead style="background-color: #f2f2f2;">
        <tr>
          <th style="text-align:left;">Documento</th>
          <th style="text-align:left;">Consultorio</th>
          <th style="text-align:left;">Fecha</th>
          <th style="text-align:left;">Jornada</th>
        </tr>
      </thead>
      <tbody>
        ${user.turnos
          .map(
            (t) => `
          <tr>
            <td>${user.documento}</td>
            <td>${user.consultorio}</td>
            <td>${formatearFecha(t.fecha)}</td>
            <td>${t.jornada}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>

    <p>Saludos cordiales,</p>
    <p><b>NELSON ENRIQUE RUEDA RODRIGUEZ</b><br/>
    Docente con funciones de Coordinación Consultorio Jurídico y Centro de Conciliación - 
    Sede CALLE 34<br/>
    <b>UNIVERSIDAD COLEGIO MAYOR DE CUNDINAMARCA</b><br/>
    Dir. Dir. Calle 34 No. 6-56, Bogotá D.C.</p>
  `,
      };

      await postData("/api/Correo/EnviarCorreo", correo);
      showAlert("success", `📩 Correo enviado a ${user.nombre} (${user.correo})`);
    } catch (error) {
      console.error(error);
      showAlert("error", "❌ No se pudo enviar el correo");
    } finally {
      setLoadingEmail(null);
    }
  };

  return (
    <div className="relative bg-gradient-to-r from-primary via-[#6A3BAF] to-[#7A5BCF] backdrop-blur supports-[backdrop-filter]:bg-primary/80 p-6 md:p-10 rounded-3xl max-w-7xl w-full m-auto shadow-2xl border border-white/10 my-6">
      
      {/* Alerta flotante animada */}
      {alertInfo && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl transition-all duration-300 animate-bounce ${
            alertInfo.type === "success"
              ? "bg-emerald-600 border border-emerald-400 text-white"
              : alertInfo.type === "error"
              ? "bg-rose-600 border border-rose-400 text-white"
              : "bg-amber-500 border border-amber-300 text-white"
          }`}
        >
          <span className="font-medium text-sm tracking-wide">{alertInfo.message}</span>
          <button
            type="button"
            onClick={() => setAlertInfo(null)}
            className="ml-2 opacity-70 hover:opacity-100 font-bold transition"
          >
            ✕
          </button>
        </div>
      )}

      <Card className="border-none bg-transparent shadow-none text-white">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-xl md:text-2xl font-extrabold tracking-wider text-white">
            Notificacion de Turnos
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Barra de búsqueda */}
          <div className="flex justify-between items-center gap-2 flex-col md:flex-row">
            <div className="relative w-full md:w-1/2">
              <Input
                placeholder="Buscar por nombre, correo o documento..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl py-2.5 pl-9 pr-3 border border-white/30 bg-white/10 text-white placeholder-white/50 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/20 transition text-sm"
              />
              <svg
                className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Tabla con contenedor Glassmorphism */}
          <div className="overflow-x-auto rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md shadow-2xl">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-white/10 text-white">
                <tr>
                  <th className="px-4 py-3.5 text-left text-xs uppercase tracking-wider font-semibold">
                    Nombre
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs uppercase tracking-wider font-semibold">
                    Correo
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs uppercase tracking-wider font-semibold">
                    Tipo Doc
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs uppercase tracking-wider font-semibold">
                    Documento
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs uppercase tracking-wider font-semibold">
                    Total turnos
                  </th>
                  <th className="px-4 py-3.5 text-center text-xs uppercase tracking-wider font-semibold">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-white/90 font-light text-sm">
                {filtered.map((user, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-medium text-white">{user.nombre}</td>
                    <td className="px-4 py-3 text-white/80">{user.correo}</td>
                    <td className="px-4 py-3 text-white/80">{user.tipoDocumento}</td>
                    <td className="px-4 py-3 text-white/80">{user.documento}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white">
                        {user.turnos.length}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex gap-2 justify-center">
                      <Button
                        onClick={() => handleSendEmail(user)}
                        disabled={loadingEmail === user.id}
                        className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-md transition-all active:scale-95 cursor-pointer text-xs font-semibold px-4 py-2"
                        size="sm"
                      >
                        {loadingEmail === user.id ? (
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Enviando...</span>
                          </div>
                        ) : (
                          "Enviar correo"
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <p className="text-center text-white/60 py-6 text-sm">
                No se encontraron resultados.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}