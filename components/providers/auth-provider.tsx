"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

type User = {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  picture?: string;
};

type AuthContextType = {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => void;
  logout: () => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  refreshToken: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Try to refresh token
        const refreshed = await refreshToken();

        if (!refreshed) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Function to refresh the access token
  const refreshToken = async (): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) return false;

      const data = await response.json();
      setAccessToken(data.accessToken);

      // Fetch user data with new token
      await fetchUserData(data.accessToken);

      return true;
    } catch (error) {
      console.error("Token refresh error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch user data with token
  const fetchUserData = async (token: string) => {
    try {
      const response = await fetch("/api/user/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      console.error("Error fetching user data:", error);
      logout();
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || "Login failed" };
      }

      setUser(data.user);
      setAccessToken(data.accessToken);

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "An unexpected error occurred" };
    } finally {
      setIsLoading(false);
    }
  };

  // Google login function
  const loginWithGoogle = () => {
    window.location.href = "/api/auth/google";
  };

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);

      await fetch("/api/auth/logout", {
        method: "POST",
      });

      setUser(null);
      setAccessToken(null);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || "Registration failed" };
      }

      setUser(data.user);
      setAccessToken(data.accessToken);

      return { success: true };
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, error: "An unexpected error occurred" };
    } finally {
      setIsLoading(false);
    }
  };

  // Set up token refresh interval
  useEffect(() => {
    if (!accessToken) return;

    // Refresh token every 10 minutes (600000 ms)
    const refreshInterval = setInterval(() => {
      refreshToken();
    }, 600000);

    return () => clearInterval(refreshInterval);
  }, [accessToken]);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading,
        login,
        loginWithGoogle,
        logout,
        register,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
