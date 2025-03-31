"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-provider";

export function ProtectedRoute({
  children,
  adminOnly = false,
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // If no user is logged in, redirect to login
      if (!user) {
        router.push("/signin");
      }
      // If route requires admin access but user is not admin, redirect to dashboard
      else if (adminOnly && !user.isAdmin) {
        router.push("/dashboard");
      }
    }
  }, [user, isLoading, router, adminOnly]);

  // Show loading or nothing while checking authentication
  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // If admin route and user is not admin
  if (adminOnly && !user.isAdmin) {
    return null;
  }

  // If user is authenticated (and is admin if adminOnly is true), render children
  return <>{children}</>;
}
