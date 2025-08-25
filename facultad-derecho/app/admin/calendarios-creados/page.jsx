"use client";
import React from "react";
import { Eye, Pencil, Trash2, CalendarDays } from "lucide-react";
import useFetchData from "@/components/FetchData";
import { useRouter } from "next/navigation";

// shadcn/ui
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const calendariosEjemplo = [
  {
    nombre: "Calendario Primer Trimestre 2024",
    trimestre: "Q1 (Ene–Mar)",
    inicio: "15/01/2024",
    fin: "20/03/2024",
    diaConciliacion: "Miércoles",
    consultorios: ["Consultorio 1", "Consultorio 2"],
  },
  {
    nombre: "Calendario Conciliaciones Mayo",
    trimestre: "Q2 (Abr–Jun)",
    inicio: "02/05/2024",
    fin: "30/05/2024",
    diaConciliacion: "Viernes",
    consultorios: ["Consultorio 3", "Consultorio 4"],
  },
];


export default function ListaCalendarios({ calendarios = calendariosEjemplo }) {
  // ✅ Hook dentro del componente
  const { data: calendario, loading } = useFetchData(
    "/api/Calendarios/GetCalendarios"
  );
  const router = useRouter();

  // Si quieres, usa los datos reales, si no hay, usa el ejemplo
  const lista = calendario?.length ? calendario : calendarios;
  console.log(lista);

  if (loading) return <p>Cargando calendarios...</p>;
  if (!lista || lista.length === 0) return <p>No hay calendarios.</p>;

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-primary text-3xl font-bold mb-8 flex items-center gap-2">
        <CalendarDays className="h-7 w-7 text-facultad-azul" /> Calendarios
        Creados
      </h2>

      <div className="grid gap-6 md:grid-cols-3">
        {lista.map((cal) => (
          <Card key={cal.id} className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-[#333333] text-lg">
                {cal.semestre} - {cal.anio}
              </CardTitle>
              <CardDescription className="text-[#666666]">
                {new Date(cal.fechaInicio).toLocaleDateString()} —{" "}
                {new Date(cal.fechaFin).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-semibold text-[#333333]">
                    Conciliación:{" "}
                  </span>
                  <Badge className="rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                    {cal.diaConciliacion || "No asignado"}
                  </Badge>
                </div>
                <div>
                  <span className="font-semibold text-[#333333]">Estado: </span>
                  <Badge className="rounded-full bg-primary text-white px-2.5 py-1 text-[12px] font-medium">
                    {cal.estado}
                  </Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button
                variant="secondary"
                className="rounded-lg bg-primary text-white hover:bg-[#6A3BAF]"
              >
                <Eye className="h-4 w-4 mr-1" /> Ver
              </Button>
              <Button
                variant="secondary"
                className="rounded-lg bg-facultad-azul text-white hover:bg-[#003399]"
                onClick={() => router.push(`/admin/calendario-editar/${cal.id}`)}
              >
                <Pencil className="h-4 w-4 mr-1" /> Editar
              </Button>
              <Button
                variant="destructive"
                className="rounded-lg bg-[#E4002B] hover:bg-[#C00024] text-white"
              >
                <Trash2 className="h-4 w-4 mr-1" /> Eliminar
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
