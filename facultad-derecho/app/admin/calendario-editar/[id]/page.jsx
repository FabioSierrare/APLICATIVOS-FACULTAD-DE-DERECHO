"use client";
export const runtime = "edge"
import { useParams } from "next/navigation";
import EditarCalendario from "@/components/CalendarioAbogadosUI";

export default function EditarCalendarioPage() {
  const params = useParams();
  const { id } = params; // id del calendario

  return <EditarCalendario calendarioEditarId={id} />;
}
