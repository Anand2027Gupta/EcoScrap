import { API_URL } from "./config.js";
import { apiFetch } from "./request.js";

function getAuthHeaders() {
  const token =
    localStorage.getItem("access_token");

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}

export async function getHandoverRecord(
  handoverId
) {
  const response = await apiFetch(
    `${API_URL}/handovers/${handoverId}/record`,
    {
      method: "GET",
      headers: {
        ...getAuthHeaders(),
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Failed to load digital record"
    );
  }

  return data.record;
}
