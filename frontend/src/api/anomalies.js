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

export async function getAnomalies() {
  const response = await apiFetch(
    `${API_URL}/anomalies`,
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
      data.detail || "Failed to load anomaly data"
    );
  }

  return data.anomalies;
}
