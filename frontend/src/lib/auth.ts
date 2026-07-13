import { jwtDecode } from "jwt-decode";
import { DecodedToken, User } from "@/types";

export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

export const setToken = (token: string): void => {
  localStorage.setItem("token", token);
};

export const removeToken = (): void => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const setUser = (user: User): void => {
  localStorage.setItem("user", JSON.stringify(user));
};

export const getUser = (): User | null => {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
};

export const getDecodedToken = (): DecodedToken | null => {
  const token = getToken();
  if (!token) return null;
  try {
    return jwtDecode<DecodedToken>(token);
  } catch {
    return null;
  }
};

export const isTokenExpired = (): boolean => {
  const decoded = getDecodedToken();
  if (!decoded) return true;
  return decoded.exp * 1000 < Date.now();
};

export const isAuthenticated = (): boolean => {
  return !!getToken() && !isTokenExpired();
};
