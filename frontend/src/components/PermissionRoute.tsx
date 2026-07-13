"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Loader from "@/components/ui/Loader";

interface PermissionRouteProps {
  children: React.ReactNode;
  requiredRoles: string[];
  fallback?: React.ReactNode;
}

export default function PermissionRoute({
  children,
  requiredRoles,
  fallback,
}: PermissionRouteProps) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (user.role && requiredRoles.includes(user.role.name)) {
        setHasPermission(true);
      } else {
        router.push("/dashboard");
      }
    }
  }, [user, loading, router, requiredRoles]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    );
  }

  if (!hasPermission) {
    return fallback || (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-3xl font-bold text-gray-200 mb-4">Access Denied</h1>
        <p className="text-gray-400 mb-8">
          You don't have permission to access this page.
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
