import api from "@/services/api";
import { User } from "@/types";

export interface UsersResponse {
  users: User[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

export const getUsers = (page = 1, limit = 10) =>
  api.get<UsersResponse>("/users", { params: { page, limit } }).then((r) => r.data);

export const getUserById = (id: number) =>
  api.get<User>(`/users/${id}`).then((r) => r.data);
