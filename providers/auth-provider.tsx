"use client"; // Ensures this runs only on the client side

import React, {
  useState,
  useCallback,
  useEffect,
  ReactNode,
  createContext,
} from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosResponse } from "axios";
import { User } from "@/db/schema";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL, // ✅ Correct env variable usage for Next.js
  withCredentials: true, // ✅ Ensures cookies are sent with requests
  headers: {
    "Content-Type": "application/json",
  },
});

export interface AuthContextType {
  user: User | null;
  login: (accessToken: string, userData: User) => void;
  logout: () => void;
  accessToken: string | null;
  displayFlag: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [displayFlag, setDisplayFlag] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter(); // Next.js navigation

  const login = (accessToken: string, userData: User) => {
    setAccessToken(accessToken);
    setUser(userData);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDisplayFlag(true);
    }, 2000);
    return () => clearTimeout(timeout);
  }, []);

  const logout = useCallback(async () => {
    try {
      // Call logout API to clear cookies
      await axiosInstance.post("/auth/logout");

      // Clear local state
      setAccessToken(null);
      setUser(null);

      // Redirect to home page
      router.push("/");
    } catch (error) {
      console.error("Error during logout:", error);
      // Even if API call fails, clear local state and redirect
      setAccessToken(null);
      setUser(null);
      router.push("/");
    }
  }, [router]);

  const generateNewToken = useCallback(async (): Promise<string | null> => {
    try {
      const response = await axiosInstance.get<{
        accessToken: string;
        user: User;
      }>("/auth/refresh", { withCredentials: true });
      console.log(response.data);
      setAccessToken(response.data.accessToken);
      setUser(response.data.user);

      return response.data.accessToken;
    } catch (error) {
      console.error("Failed to refresh token:", error);
      logout();
      return null;
    }
  }, [logout]);

  useEffect(() => {
    if (accessToken === null) {
      console.log("Generating accessToken...");
      generateNewToken();
    }

    const requestInterceptor = axiosInstance.interceptors.request.use(
      (config) => {
        if (accessToken) {
          config.headers["Authorization"] = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          const newAccessToken = await generateNewToken();
          if (newAccessToken) {
            originalRequest.headers[
              "Authorization"
            ] = `Bearer ${newAccessToken}`;
            return axiosInstance(originalRequest);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axiosInstance.interceptors.request.eject(requestInterceptor);
      axiosInstance.interceptors.response.eject(responseInterceptor);
    };
  }, [accessToken, generateNewToken, logout]);

  const contextValue: AuthContextType = {
    user,
    login,
    logout,
    accessToken,
    displayFlag,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {/* {user && accessToken && displayFlag && children} */}
      {children}
    </AuthContext.Provider>
  );
};
