"use client"
import { useState, useEffect, useCallback } from "react";
import getAuthHeaders from "./Authorization";

export default function useFetchData(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Usamos useCallback para evitar ciclos infinitos si usas esta función en otros useEffect
  const fetchData = useCallback(async () => {
    // Si no hay URL (p.ej. pasaron null) no intentamos hacer fetch
    if (!url) {
      setLoading(false);
      setData(null);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      
      // 1. Obtener el token del localStorage
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      // 2. Configurar los headers de seguridad
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        // Manejo específico de errores de seguridad
        if (response.status === 401) throw new Error("Sesión expirada o no autorizada");
        if (response.status === 403) throw new Error("Acceso denegado por seguridad");
        
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const json = await response.json();
      setData(json);
      setError(null);
    } catch (err) {
      setError(err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    // Si no hay URL, reseteamos los estados y no llamamos al fetch
    if (!url) {
      setLoading(false);
      setData(null);
      setError(null);
      return;
    }

    fetchData();
  }, [fetchData, url]);

  return { data, loading, error, fetchData };
}