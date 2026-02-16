import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Auth store: token + role in Zustand state and localStorage.
 * persist middleware syncs token, user, role to localStorage["lms-auth"].
 */
export const useAuthStore = create(
  persist(
    (set) => ({
      // State (also persisted to localStorage)
      token: null,
      user: null,
      role: null, // "admin" | "teacher" | "student"

      setAuth: (token, role, user = null) =>
        set({
          token,
          role,
          user: user || { name: "", email: "" },
        }),

      logout: () =>
        set({
          token: null,
          user: null,
          role: null,
        }),

      updateUser: (user) => set({ user }),
    }),
    {
      name: "lms-auth",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        role: state.role,
      }),
    },
  ),
);

// Convenience selector: useAuthStore((s) => s.role) for minimal re-renders
export const useIsLoggedIn = () => !!useAuthStore((s) => s.token);
