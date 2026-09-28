import { API_URL } from "./config.js";
import { apiFetch } from "./request.js";

function getAuthHeaders() {
  const token = localStorage.getItem("access_token");

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}

export async function getHandovers() {
  const response = await apiFetch(
    `${API_URL}/handovers`,
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
      data.detail || "Failed to fetch handovers"
    );
  }

  return data.handovers;
}

export async function createHandover(
  handover
) {
  const response = await apiFetch(
    `${API_URL}/handovers`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(handover),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Failed to create handover"
    );
  }

  return data;
}

export async function updateHandoverStatus(
  handoverId,
  status,
  paymentStatus
) {
  const response = await apiFetch(
    `${API_URL}/handovers/${handoverId}/status`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        status,
        payment_status: paymentStatus,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Failed to update handover status"
    );
  }

  return data;
}
