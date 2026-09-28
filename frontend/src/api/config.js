const envApiUrl =
  typeof import.meta !== "undefined" && import.meta.env
    ? import.meta.env.VITE_API_URL
    : typeof process !== "undefined" && process.env
    ? process.env.VITE_API_URL
    : null;

export const API_URL =
  (envApiUrl && String(envApiUrl).replace(/\/+$/, "")) ||
  "http://127.0.0.1:8000";
