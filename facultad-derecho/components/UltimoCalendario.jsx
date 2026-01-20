import { useEffect, useState } from "react";
import useFetchData from "@/components/FetchData";

export function useUltimoCalendario() {
  const { data: calendarios } = useFetchData(
    "/api/Calendarios/GetCalendarios"
  );

  const [ultimoCalendario, setUltimoCalendario] = useState([]);

  useEffect(() => {
    if (calendarios && calendarios.length > 0) {
      setUltimoCalendario(calendarios[calendarios.length - 1]);
    }
  }, [calendarios]);

  return ultimoCalendario;
}
