"use client"
import useFetchData from "@/components/FetchData";
import { useEffect, useState } from "react";
import { useUsuarioTurno } from "@/components/UsuarioData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Search } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Turnos() {
  const { data: Turno } = useFetchData("/api/Turnos/GetTurnos");
  const { data: Usuarios } = useFetchData("/api/Usuarios/GetUsuarios");
  const { data: Rol } = useFetchData("/api/Rol/GetRol");
  const { data: Consultorios } = useFetchData("/api/Consultorios/GetConsultorios");
  const [Turnos, setmisTurnos] = useState([]);
  const [search, setSearch] = useState(""); // estado para búsqueda
  const { usuarioId, consultorioId, calendarioId } = useUsuarioTurno();
  const router = useRouter();

  useEffect(() => {
    if (!Turno || !usuarioId || !calendarioId || !Usuarios || !Rol || !Consultorios) return;

    const TurnosX = Turno.map((t) => {
      const usuario = Usuarios.find((u) => u.id === t.usuarioId);
      const Consultorio = Consultorios.find((c) => c.id === t.consultorioId);
      return {
        ...t,
        nombre: usuario?.nombre,
        documento: usuario?.documento,
        correo: usuario?.correo,
        consultorio: Consultorio?.nombre,
      };
    });
    setmisTurnos(TurnosX);
  }, [Turno, usuarioId, calendarioId, Usuarios, Rol, Consultorios]);

  // Filtrado en tiempo real
  const filteredTurnos = Turnos.filter(
    (turno) =>
      turno?.nombre?.toLowerCase().includes(search.toLowerCase()) ||
      turno?.consultorio?.toLowerCase().includes(search.toLowerCase()) ||
      turno?.jornada?.toLowerCase().includes(search.toLowerCase()) ||
      turno?.documento?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="m-6 md:m-10">
      {/* Barra de búsqueda */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold text-[#553285]">Gestión de Turnos</h1>
        <div className="flex w-full md:w-1/2 items-center gap-2">
          <Input
            type="text"
            placeholder="Buscar por estudiante y documento"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl border-gray-300 focus:ring-2 focus:ring-[#553285] transition"
          />
          <Button variant="secondary" className="bg-[#553285] text-white hover:bg-[#553285]/80 rounded-xl px-4">
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Lista de turnos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredTurnos.length === 0 ? (
          <p className="text-center text-gray-500 col-span-full">
            No se encontraron turnos.
          </p>
        ) : (
          filteredTurnos.map((turno, index) => {
            const fechaObj = new Date(turno.fecha);

            const fechaColombia = fechaObj.toLocaleDateString("es-CO", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            });

            const fechaFormateada = fechaObj.toLocaleDateString("es-CO", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            });

            return (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-md p-6 w-full transition hover:shadow-xl border border-gray-200"
              >
                <div className="border-[#553285] pb-2 border-b-2 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-primary">
                    Información del Turno
                  </h2>
                  <Button
                    variant="secondary"
                    className="rounded-lg bg-primary text-white hover:bg-primary/80 cursor-pointer"
                    onClick={() =>
                      router.push(`/admin/turnos/${turno.id}`)
                    }
                  >
                    <Pencil className="h-4 w-4 mr-1" /> Editar
                  </Button>
                </div>

                <div className="space-y-3 mt-3">
                  <p className="text-gray-700">
                    <span className="font-semibold text-[#333333]">
                      Fecha Original:
                    </span>{" "}
                    {fechaColombia}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold text-[#333333]">
                      Jornada:
                    </span>
                    <span className="ml-2 px-3 py-1 bg-[#553285] text-white text-sm rounded-full inline-block">
                      {turno.jornada}
                    </span>
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold text-[#333333]">
                      Fecha Formateada:
                    </span>
                    <span className="ml-2 text-[#553285] font-medium">
                      {fechaFormateada}
                    </span>
                  </p>

                  <p className="text-gray-700">
                    <span className="font-semibold text-[#333333]">
                      Estudiante:
                    </span>
                    <span className="ml-2 px-3 py-1 bg-[#553285] text-white text-sm rounded-full inline-block">
                      {turno.nombre}
                    </span>
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold text-[#333333]">
                      Consultorio:
                    </span>
                    <span className="ml-2 text-[#553285] font-medium">
                      {turno.consultorio}
                    </span>
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
