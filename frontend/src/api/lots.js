import { API_URL } from "./config.js";
import { apiFetch } from "./request.js";

function getAuthHeaders() {
  const token = localStorage.getItem("access_token");

  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
}


// =========================
// CREATE LOT
// =========================

export async function createLot(lot) {
  const response = await apiFetch(`${API_URL}/lots`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(lot),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Failed to create lot"
    );
  }

  return data;
}


// =========================
// GET LOTS
// =========================

export async function getLots() {
  const response = await apiFetch(`${API_URL}/lots`, {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Failed to fetch lots"
    );
  }

  return data.lots;
}


// =========================
// UPLOAD IMAGE
// =========================

export async function uploadImage(file) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await apiFetch(
    `${API_URL}/upload-image`,
    {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
      },
      body: formData,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Image upload failed"
    );
  }

  return data;
}


// =========================
// AI IMAGE PREDICTION
// =========================

export async function predictImage(file) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await apiFetch(
    `${API_URL}/predict`,
    {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
      },
      body: formData,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Image prediction failed"
    );
  }

  return data;
}


// =========================
// MATCH RECYCLERS
// =========================

export async function matchRecyclers(
  material_category,
  location,
  weight_kg
) {
  const response = await apiFetch(
    `${API_URL}/match-recyclers`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        material_category,
        location,
        weight_kg,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Recycler matching failed"
    );
  }

  return data;
}


// =========================
// PRICE ESTIMATION
// =========================

export async function estimatePrice(
  materialCategory,
  subcategory,
  location,
  weight
) {
  const response = await apiFetch(
    `${API_URL}/estimate-price`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        material_category: materialCategory,
        subcategory: subcategory,
        location: location,
        weight: Number(weight),
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Failed to estimate price"
    );
  }

  return data;
}
