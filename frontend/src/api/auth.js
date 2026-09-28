import { API_URL } from "./config.js";
import { apiFetch } from "./request.js";

export async function registerUser(
  name,
  email,
  password,
  role,
  recyclerId = null
) {
  const response = await apiFetch(`${API_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      email,
      password,
      role,
      recycler_id: recyclerId,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Registration failed"
    );
  }

  return data;
}

export async function loginUser(
  email,
  password
) {
  const response = await apiFetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Login failed"
    );
  }

  return data;
}
