// src/context/AuthContext.tsx
// Global auth state — current user is available in every component via useAuth()

import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { login as apiLogin, logout as apiLogout, getMe } from "../api/auth";
import type { UserResponse } from "../api/auth";

interface AuthContextType {
  user: UserResponse | null;
  loading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on app load
  useEffect(() => {
    const stored = localStorage.getItem("keheilan_user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as UserResponse;
        // Re-validate with backend
        getMe(parsed.user_id)
          .then((u) => setUser(u))
          .catch(() => localStorage.removeItem("keheilan_user"))
          .finally(() => setLoading(false));
      } catch {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (phone: string, password: string) => {
    const u = await apiLogin({ phone, password });
    setUser(u);
    localStorage.setItem("keheilan_user", JSON.stringify(u));
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
    localStorage.removeItem("keheilan_user");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
