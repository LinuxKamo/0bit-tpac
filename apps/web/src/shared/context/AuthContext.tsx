"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { authService } from "@/features/auth/services/auth.service";
import { useRouter } from "next/navigation";

export type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "MANAGER"
  | "CORPORATE_ADMIN"
  | "MENTOR"
  | "MEMBER";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
  phone?: string | null;
  city?: string | null;
  country?: string | null;
  language?: string | null;
  dateOfBirth?: string | null;
  accountStatus: string;
  createdAt?: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ROLE_ROUTES: Record<string, string> = {
  SUPER_ADMIN:     "/super-admin",
  ADMIN:           "/admin",
  MANAGER:         "/manager",
  CORPORATE_ADMIN: "/corporate",
  MENTOR:          "/mentor",
  MEMBER:          "/member",
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter(); // ← moved inside the component

  const loadUser = async () => {
    try {
      const response = await authService.getMe();
      setUser(response.data?.user || null);
    } catch (err: any) {
      const status = err?.response?.status;
      // Only clear session on definitive auth rejection (401/403), not network errors.
      // Network errors in prod (CORS, timeout) should not log the user out.
      if (status === 401 || status === 403) {
        try { await authService.logout(); } catch { /* ignore */ }
        localStorage.removeItem("auth_token");
        await fetch("/api/auth/session", { method: "DELETE" }).catch(() => {});
      }
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => { await loadUser(); };

  useEffect(() => { loadUser(); }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    const { user, token } = response.data ?? {};

    if (token) {
      localStorage.setItem("auth_token", token);
      // Set the token cookie on the Vercel domain so Next.js middleware can read it
      await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
    }

    setUser(user ?? null);
    if (user) {
      window.location.href = ROLE_ROUTES[user.role] ?? "/";
    }
  };

  const logout = async () => {
    await authService.logout();
    localStorage.removeItem("auth_token");
    await fetch("/api/auth/session", { method: "DELETE" });
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, setUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}