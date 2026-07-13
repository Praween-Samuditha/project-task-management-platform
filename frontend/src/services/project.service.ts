import api from "@/services/api";
import { Project } from "@/types";

export interface ProjectsResponse {
  projects: Project[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

export const getProjects = (page = 1, limit = 10, search = "") =>
  api.get<ProjectsResponse>("/projects", { params: { page, limit, search } }).then((r) => r.data);

export const getProjectById = (id: number) =>
  api.get<Project>(`/projects/${id}`).then((r) => r.data);

export const createProject = (data: { name: string; description?: string; status?: string }) =>
  api.post<Project>("/projects", data).then((r) => r.data);

export const updateProject = (id: number, data: { name?: string; description?: string; status?: string }) =>
  api.put<Project>(`/projects/${id}`, data).then((r) => r.data);

export const deleteProject = (id: number) =>
  api.delete(`/projects/${id}`).then((r) => r.data);
