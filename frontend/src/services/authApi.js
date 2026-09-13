import { apiRequest, apiEnabled, csrfCookie } from "./apiClient";

export async function loginRequest(email, password) {
  if (!apiEnabled) return null;
  await csrfCookie();
  return apiRequest("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
}

export async function signupRequest(payload) {
  await csrfCookie();
  return apiRequest("/auth/signup", { method: "POST", body: JSON.stringify(payload) });
}

export async function currentUserRequest() {
  if (!apiEnabled) return null;
  return apiRequest("/auth/user");
}

export async function logoutRequest() {
  if (!apiEnabled) return null;
  return apiRequest("/auth/logout", { method: "POST" });
}
