"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { newApiFetch, saveTokens, saveUser, clearTokens, loadUser, getAccessToken } from "@/lib/newApi";
import type { NewUser, LoginResponse } from "@/lib/newTypes";

interface AuthCtx {
  user: NewUser | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx>({
  user: null, accessToken: null, isLoading: true,
  login: async () => {}, logout: () => {},
});

export function NewAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]               = useState<NewUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading]     = useState(true);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const stored = loadUser<NewUser>();
    const token  = getAccessToken();
    if (stored && token) {
      setUser(stored);
      setAccessToken(token);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await newApiFetch<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    saveTokens(data.accessToken, data.refreshToken);
    saveUser(data.user);
    setUser(data.user);
    setAccessToken(data.accessToken);
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
    setAccessToken(null);
    if (typeof window !== "undefined") window.location.href = "/v2/login";
  }, []);

  return (
    <Ctx.Provider value={{ user, accessToken, isLoading, login, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export function useNewAuth() {
  return useContext(Ctx);
}
