import { API_URL } from "./config.js";

/**
 * EcoScrap API request helper.
 *
 * Wraps fetch so that technical network failures
 * (backend offline, no internet, DNS failure)
 * never surface as raw "TypeError: Failed to fetch".
 *
 * Backend error messages (FastAPI `detail`) are still
 * passed through untouched by the calling modules.
 */

const NETWORK_ERROR_MESSAGE =
  "Could not reach the server. Please check your internet connection and try again.";

export async function apiFetch(url, options = {}) {
  try {
    return await fetch(url, options);
  } catch (err) {
    /*
     * Keep the technical detail in the console,
     * show a human-readable message in the UI.
     */
    console.error(
      "EcoScrap API network error:",
      url,
      err
    );

    throw new Error(NETWORK_ERROR_MESSAGE, { cause: err });
  }
}

export { API_URL, NETWORK_ERROR_MESSAGE };
