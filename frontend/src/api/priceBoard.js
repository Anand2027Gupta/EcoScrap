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

export async function getPriceBoard() {
  const response = await apiFetch(
    `${API_URL}/price-board`,
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
      data.detail || "Failed to load price board"
    );
  }

  return data.prices;
}

export async function getPriceHistory(
  materialCategory = "",
  location = ""
) {
  const params = new URLSearchParams();

  if (materialCategory) {
    params.append(
      "material_category",
      materialCategory
    );
  }

  if (location) {
    params.append(
      "location",
      location
    );
  }

  const query =
    params.toString();

  const response = await apiFetch(
    `${API_URL}/price-history${
      query ? `?${query}` : ""
    }`,
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
      data.detail || "Failed to load price history"
    );
  }

  return data.prices;
}
