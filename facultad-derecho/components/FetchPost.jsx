export async function postData(endpoint, body) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL + endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    // Leer una vez el body como texto
    const rawData = await res.text();

    // Intentar parsear a JSON si es posible
    let data;
    try {
      data = JSON.parse(rawData);
    } catch {
      data = rawData; // si no es JSON, dejarlo como texto
    }

    if (!res.ok) {
      throw new Error(
        typeof data === "string"
          ? data
          : data?.message || data?.error || `Error: ${res.status}`
      );
    }

    return data;
  } catch (error) {
    console.error("Error al enviar datos:", error);
    throw error;
  }
}
