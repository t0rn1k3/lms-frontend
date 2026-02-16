import { createContext, useContext, useCallback } from "react";
import { useAuthStore } from "../store";
import { authService } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { token, user, role, setAuth, logout } = useAuthStore();

  const login = useCallback(
    async (email, password, role) => {
      const loginByRole = {
        admin: authService.adminLogin,
        teacher: authService.teacherLogin,
        student: authService.studentLogin,
      };
      const loginFn = loginByRole[role];
      const { data } = await loginFn(email, password);
      const tokenData = data.data;
      if (!tokenData || typeof tokenData !== "string") {
        throw new Error(data.message || "Invalid credentials");
      }
      setAuth(tokenData, role, { email });
      return tokenData;
    },
    [setAuth],
  );

  const value = {
    user,
    role,
    token,
    login,
    logout,
    isLoggedIn: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
