import getAuthHeaders from "./Authorization";

export async function deleteData(endpoint, id) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
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
    console.error("Error al eliminar (DELETE):", error);
    throw error;
  }
}