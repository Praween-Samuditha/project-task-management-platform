import api from "@/services/api";
import { Task } from "@/types";

export interface TasksResponse {
  tasks: Task[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

export const getTasks = (params?: { page?: number; limit?: number; status?: string; priority?: string; projectId?: number }) =>
  api.get<TasksResponse>("/tasks", { params }).then((r) => r.data);

export const getTaskById = (id: number) =>
  api.get<Task>(`/tasks/${id}`).then((r) => r.data);

export const createTask = (data: {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string;
  projectId: number;
  assigneeId?: number;
}) => api.post<Task>("/tasks", data).then((r) => r.data);

export const updateTask = (id: number, data: Partial<{
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
  assigneeId: number;
}>) => api.put<Task>(`/tasks/${id}`, data).then((r) => r.data);

export const deleteTask = (id: number) =>
  api.delete(`/tasks/${id}`).then((r) => r.data);
