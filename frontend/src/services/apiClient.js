const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

export const apiEnabled = Boolean(API_URL);

function xsrfToken() {
  const cookie = document.cookie.split("; ").find((value) => value.startsWith("XSRF-TOKEN="));
  return cookie ? decodeURIComponent(cookie.slice("XSRF-TOKEN=".length)) : null;
}

async function request(path, options = {}) {
  const token = xsrfToken();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeout ?? 30000);
  const { timeout: _timeout, ...fetchOptions } = options;
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      ...(token ? { "X-XSRF-TOKEN": token } : {}),
      ...(options.headers || {}),
    },
      ...fetchOptions,
      signal: controller.signal,
    });
  } catch (error) {
    if (error.name === "AbortError") throw new Error("The server took too long to respond. Please check that Laravel is running.");
    throw error;
  } finally {
    clearTimeout(timeout);
  }
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(body.message || "The server request failed.");
    error.status = response.status;
    error.errors = body.errors;
    throw error;
  }
  return body;
}

export async function apiRequest(path, options) {
  const method = (options?.method || "GET").toUpperCase();
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    await csrfCookie();
  }
  return request(`/api/v1${path}`, options);
}

export async function csrfCookie() {
  return request("/sanctum/csrf-cookie", { headers: { Accept: "application/json" } });
}

export { request };
