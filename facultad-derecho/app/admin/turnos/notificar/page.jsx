"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useFetchData from "@/components/FetchData";
import { postData } from "@/components/FetchPost";

export default function TurnosTable() {
  const [search, setSearch] = useState("");

  const { data: Usuarios, loading } = useFetchData("/api/Usuarios/GetUsuarios");
  const { data: TipoDocumento, lod } = useFetchData(
    "/api/TiposDocumento/GetTiposDocumento"
  );
  const { data: Consultorios, loadin } = useFetchData(
    "/api/UsuarioConsultorios/GetUsuarioConsultorio"
  );

  const { data: Turnos, lo } = useFetchData("/api/Turnos/GetTurnos");
  const { data: Calendario } = useFetchData("/api/Calendarios/GetCalendarios");

  if (loading || lod || loadin || lod) {
    return <h1>Cargando...</h1>;
  }

  if (!Usuarios || !TipoDocumento || !Consultorios || !Turnos || !Calendario) {
    return <h1>Esperando datos...</h1>;
  }

  const ultimoCalendario = Calendario[Calendario.length - 1];

  const usuarios = Usuarios.map((u) => {
    const tipoDoc = TipoDocumento.find((t) => t.id === u.tipoDocumentoId);
    const consu = Consultorios.find((t) => t.usuarioId === u.id);

    // ✅ Filtra los turnos que pertenecen a este usuario
    const turnosUsuario = Turnos.filter((t) => t.usuarioId === u.id && t.calendarioId === ultimoCalendario.id);

    return {
      ...u,
      tipoDocumento: tipoDoc ? tipoDoc.nombre : "Sin definir",
      consultorio: consu ? consu.consultorioId : "Sin definir",
      turnos: turnosUsuario, // 👈 aquí guardas solo los suyos
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
    if (isNaN(fecha)) return fechaString; // fallback si no es válida
    const dia = fecha.getDate();
    const mes = meses[fecha.getMonth()];
    const año = fecha.getFullYear();
    return `${dia} de ${mes} de ${año}`;
  }

  const handleSendEmail = async (user) => {
    if(user.turnos.length === 0) return alert("Este usuario no tiene turnos que notificar")
    try {
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
      alert(`📩 Correo enviado a ${user.nombre} (${user.correo})`);
    } catch (error) {
      console.error(error);
      alert("❌ No se pudo enviar el correo");
    }
  };

  return (
    <div className="p-6 min-h-screen">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-[#553285] ">
            Notificacion de Turnos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Barra de búsqueda */}
          <div className="mb-4 flex justify-between items-center gap-2 flex-col md:flex-row">
            <Input
              placeholder="Buscar por nombre, correo o documento..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-1/2 border-gray-300 focus:border-[#553285] focus:ring-[#553285]"
            />
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#553285] text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Nombre
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Correo
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Tipo Doc
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Documento
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Total turnos
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filtered.map((user, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{user.nombre}</td>
                    <td className="px-4 py-3 text-sm">{user.correo}</td>
                    <td className="px-4 py-3 text-sm">{user.tipoDocumento}</td>
                    <td className="px-4 py-3 text-sm">{user.documento}</td>
                    <td className="px-4 py-3 text-sm">{user.turnos.length}</td>
                    <td className="px-4 py-3 flex gap-2 justify-center">
                      <Button
                        onClick={() => handleSendEmail(user)}
                        className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg cursor-pointer"
                        size="sm"
                      >
                        Enviar correo
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <p className="text-center text-gray-500 py-4">
                No se encontraron resultados.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}