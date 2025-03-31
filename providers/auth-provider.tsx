// "use client"; // Ensures this runs only on the client side

// import React, {
//   useState,
//   useCallback,
//   useEffect,
//   ReactNode,
//   createContext,
// } from "react";
// import { useRouter } from "next/navigation";
// import axios, { AxiosResponse } from "axios";
// import { User } from "@/db/schema";

// const axiosInstance = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_BACKEND_URL, // ✅ Correct env variable usage for Next.js
//   withCredentials: true, // ✅ Ensures cookies are sent with requests
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// export interface AuthContextType {
//   user: User | null;
//   login: (accessToken: string, userData: User) => void;
//   logout: () => void;
//   accessToken: string | null;
//   displayFlag: boolean;
//   isLoading: boolean;
// }

// export const AuthContext = createContext<AuthContextType | undefined>(
//   undefined
// );

// interface AuthProviderProps {
//   children: ReactNode;
// }

// export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
//   const [displayFlag, setDisplayFlag] = useState(false);
//   const [accessToken, setAccessToken] = useState<string | null>(null);
//   const [user, setUser] = useState<User | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const router = useRouter(); // Next.js navigation

//   const login = (accessToken: string, userData: User) => {
//     setAccessToken(accessToken);
//     setUser(userData);
//   };

//   useEffect(() => {
//     const timeout = setTimeout(() => {
//       setDisplayFlag(true);
//     }, 2000);
//     return () => clearTimeout(timeout);
//   }, []);

//   const logout = useCallback(async () => {
//     try {
//       // Call logout API to clear cookies
//       await axiosInstance.post("/auth/logout");

//       // Clear local state
//       setAccessToken(null);
//       setUser(null);

//       // Redirect to home page
//       router.push("/");
//     } catch (error) {
//       console.error("Error during logout:", error);
//       // Even if API call fails, clear local state and redirect
//       setAccessToken(null);
//       setUser(null);
//       router.push("/");
//     }
//   }, [router]);

//   const generateNewToken = useCallback(async (): Promise<string | null> => {
//     try {
//       const response = await axiosInstance.get<{
//         accessToken: string;
//         user: User;
//       }>("/auth/refresh", { withCredentials: true });
//       console.log("Token refresh response:", response.data);
//       setAccessToken(response.data.accessToken);
//       setUser(response.data.user);

//       return response.data.accessToken;
//     } catch (error) {
//       console.error("Failed to refresh token:", error);
//       logout();
//       return null;
//     }
//   }, [logout]);

//   // Check for existing session on mount
//   useEffect(() => {
//     const checkSession = async () => {
//       try {
//         console.log("Checking existing session...");
//         const response = await axiosInstance.get<{
//           accessToken: string;
//           user: User;
//         }>("/auth/me", { withCredentials: true });

//         console.log("Session check response:", response.data);
//         setAccessToken(response.data.accessToken);
//         setUser(response.data.user);
//       } catch (error) {
//         console.log("No existing session found, will try to refresh token");
//         if (accessToken === null) {
//           await generateNewToken();
//         }
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     checkSession();
//   }, [generateNewToken]);

//   useEffect(() => {
//     if (accessToken === null && !isLoading) {
//       console.log("Generating accessToken...");
//       generateNewToken();
//     }

//     const requestInterceptor = axiosInstance.interceptors.request.use(
//       (config) => {
//         if (accessToken) {
//           config.headers["Authorization"] = `Bearer ${accessToken}`;
//         }
//         return config;
//       },
//       (error) => Promise.reject(error)
//     );

//     const responseInterceptor = axiosInstance.interceptors.response.use(
//       (response) => response,
//       async (error) => {
//         const originalRequest = error.config;
//         if (error.response?.status === 401 && !originalRequest._retry) {
//           originalRequest._retry = true;
//           const newAccessToken = await generateNewToken();
//           if (newAccessToken) {
//             originalRequest.headers[
//               "Authorization"
//             ] = `Bearer ${newAccessToken}`;
//             return axiosInstance(originalRequest);
//           }
//         }
//         return Promise.reject(error);
//       }
//     );

//     return () => {
//       axiosInstance.interceptors.request.eject(requestInterceptor);
//       axiosInstance.interceptors.response.eject(responseInterceptor);
//     };
//   }, [accessToken, generateNewToken, logout, isLoading]);

//   const contextValue: AuthContextType = {
//     user,
//     login,
//     logout,
//     accessToken,
//     displayFlag,
//     isLoading,
//   };

//   return (
//     <AuthContext.Provider value={contextValue}>
//       {/* {user && accessToken && displayFlag && children} */}
//       {children}
//     </AuthContext.Provider>
//   );
// };

"use client"; // Ensures this runs only on the client side

import React, {
  useState,
  useCallback,
  useEffect,
  ReactNode,
  createContext,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import axios from "axios";
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
  isLoading: boolean;
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
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname(); // Get the current route

  const isDashboardRoute = pathname.startsWith("/dashboard");

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
    if (pathname.startsWith("/dashboard")) {
      try {
        await axiosInstance.post("/auth/logout");
        setAccessToken(null);
        setUser(null);
        router.push("/");
      } catch (error) {
        console.error("Error during logout:", error);
        setAccessToken(null);
        setUser(null);
        router.push("/");
      }
    }
  }, [router]);

  const generateNewToken = useCallback(async (): Promise<string | null> => {
    if (!isDashboardRoute) return null; // ✅ Skip request if not on /dashboard/**

    try {
      const response = await axiosInstance.get<{
        accessToken: string;
        user: User;
      }>("/auth/refresh", { withCredentials: true });

      console.log("Token refresh response:", response.data);
      setAccessToken(response.data.accessToken);
      setUser(response.data.user);
      return response.data.accessToken;
    } catch (error) {
      console.error("Failed to refresh token:", error);
      logout();
      return null;
    }
  }, [logout, isDashboardRoute]);

  useEffect(() => {
    if (!isDashboardRoute) return; // ✅ Skip request if not on /dashboard/**

    const checkSession = async () => {
      try {
        console.log("Checking existing session...");
        const response = await axiosInstance.get<{
          accessToken: string;
          user: User;
        }>("/auth/me", { withCredentials: true });

        console.log("Session check response:", response.data);
        setAccessToken(response.data.accessToken);
        setUser(response.data.user);
      } catch (error) {
        console.log("No existing session found, will try to refresh token");
        if (accessToken === null) {
          await generateNewToken();
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [generateNewToken, isDashboardRoute]);

  useEffect(() => {
    if (!isDashboardRoute) return; // ✅ Skip request if not on /dashboard/**

    if (accessToken === null && !isLoading) {
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
  }, [accessToken, generateNewToken, logout, isLoading, isDashboardRoute]);

  const contextValue: AuthContextType = {
    user,
    login,
    logout,
    accessToken,
    displayFlag,
    isLoading,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
