import { create } from "zustand";
import { persist } from "zustand/middleware";

const STORAGE_KEYS = {
  token: "lms_token",
  user: "lms_user",
  role: "lms_role",
};

export const useAuthStore = create(
  persist(
    (set) => ({
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
