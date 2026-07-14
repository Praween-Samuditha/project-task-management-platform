"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getUser, getDecodedToken, removeToken } from "@/lib/auth";
import { User, Role } from "@/types";

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(getUser());
    const decoded = getDecodedToken();
    setRole(decoded?.role ?? null);
    setLoading(false);
  }, []);

  const logout = useCallback(() => {
    removeToken();
    router.push("/login");
  }, [router]);

  return { user, role, logout, loading };
}
