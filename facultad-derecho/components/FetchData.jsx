"use client"
import { useState, useEffect } from "react";

export default function useFetchData(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 👇 Definimos fetchData fuera del useEffect
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL + url}`);
      if (!response.ok) {
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
  };

  useEffect(() => {
    fetchData();
  }, [url]);

  // 👇 Ahora sí lo devolvemos también
  return { data, loading, error, fetchData };
}
