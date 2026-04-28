import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { authApi } from "../services/api";

export type UserRole = "admin" | "instructor" | "student";

export interface User {
  id?: number;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  subtitle: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  error: null,
  login: async () => null,
  logout: async () => {},
  isAuthenticated: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Restore user session on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (token) {
          const response = await authApi.me();
          setUser(response.data.user);
          setError(null);
        }
      } catch (err) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    if (typeof window !== "undefined") {
      restoreSession();
    }
  }, []);

  async function login(email: string, password: string): Promise<User | null> {
    setLoading(true);
    setError(null);
    try {
      const response = await authApi.login(email, password);
      const { user, token } = response.data;

      localStorage.setItem("auth_token", token);
      localStorage.setItem("auth_user", JSON.stringify(user));
      setUser(user);
      return user;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Login failed. Please check your credentials.";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      await authApi.logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      setUser(null);
      setError(null);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export function getRoleDashboardPath(role: UserRole): string {
  switch (role) {
    case "admin": return "/admin/dashboard";
    case "instructor": return "/instructor/dashboard";
    case "student": return "/student/dashboard";
  }
}
