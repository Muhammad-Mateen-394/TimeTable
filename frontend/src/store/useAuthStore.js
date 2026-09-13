import { create } from "zustand";
import { apiEnabled, apiRequest } from "../services/apiClient";
import { currentUserRequest, loginRequest, logoutRequest, signupRequest } from "../services/authApi";

const STORAGE_KEY = "ttp_current_user";

function loadUser() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export const useAuthStore = create((set, get) => ({
  user: loadUser(),
  error: null,

  login: async (email, password) => {
    if (apiEnabled) {
      try {
        const response = await loginRequest(email, password);
        const user = response.data;
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        set({ user, error: null });
        return { ok: true, user };
      } catch (error) {
        set({ error: error.message || "Unable to sign in." });
        return { ok: false };
      }
    }
    set({ error: "Sign-in is unavailable: the API is not configured." });
    return { ok: false };
  },

  signup: async (payload) => {
    try {
      const response = await signupRequest(payload);
      const user = response.data;
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      set({ user, error: null });
      return { ok: true, user };
    } catch (error) {
      set({ error: error.message || "Unable to create account." });
      return { ok: false };
    }
  },

  logout: async () => {
    if (apiEnabled) {
      try {
        await logoutRequest();
      } catch {
        // Clear local state even if the server session has already expired.
      }
    }
    sessionStorage.removeItem(STORAGE_KEY);
    set({ user: null });
  },

  updateSchool: async (schoolData) => {
    const response = await apiRequest("/auth/school", {
      method: "PUT",
      body: JSON.stringify(schoolData),
    });
    const user = { ...get().user, school: response.data };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    set({ user });
    return response.data;
  },

  hydrate: async () => {
    if (!apiEnabled) return get().user;
    try {
      const response = await currentUserRequest();
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(response.data));
      set({ user: response.data, error: null });
      return response.data;
    } catch {
      sessionStorage.removeItem(STORAGE_KEY);
      set({ user: null });
      return null;
    }
  },

  clearError: () => set({ error: null }),
}));
