import api from "@/services/api";
import { Project, User } from "@/types";

export interface ProjectsResponse {
  projects: Project[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

export const getProjects = (page = 1, limit = 10, search = "", memberId?: number) =>
  api.get<{ data: Project[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(
    "/projects",
    { params: { page, limit, search, memberId } }
  ).then((r) => ({
    projects: r.data.data,
    pagination: {
      total: r.data.meta.total,
      page: r.data.meta.page,
      limit: r.data.meta.limit,
      totalPages: r.data.meta.totalPages,
    },
  }));

export const getProjectById = (id: number) =>
  api.get<Project>(`/projects/${id}`).then((r) => r.data);

export const getProjectMembers = (projectId: number) =>
  api.get<User[]>(`/projects/${projectId}/members`).then((r) => r.data);

export const addProjectMember = (projectId: number, userId: number) =>
  api.post(`/projects/${projectId}/members`, { userId }).then((r) => r.data);

export const removeProjectMember = (projectId: number, userId: number) =>
  api.delete(`/projects/${projectId}/members/${userId}`).then((r) => r.data);

export const createProject = (data: { name: string; description?: string; status?: string }) =>
  api.post<Project>("/projects", data).then((r) => r.data);

export const updateProject = (id: number, data: { name?: string; description?: string; status?: string }) =>
  api.put<Project>(`/projects/${id}`, data).then((r) => r.data);

export const deleteProject = (id: number) =>
  api.delete(`/projects/${id}`).then((r) => r.data);
