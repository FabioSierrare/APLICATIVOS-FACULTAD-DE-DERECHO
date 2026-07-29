import getAuthHeaders from "./Authorization";

export async function PutData(endpoint, body) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL + endpoint}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });

    const rawData = await res.text();
    let data;
    try {
      data = JSON.parse(rawData);
    } catch {
      data = rawData;
    }

    if (!res.ok) {
      throw new Error(
        typeof data === "string" ? data : data?.message || data?.error || `Error: ${res.status}`
      );
    }
    return data;
  } catch (error) {
    console.error("Error al actualizar datos (PUT):", error);
    throw error;
  }
}
