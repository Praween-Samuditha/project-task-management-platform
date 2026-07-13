// Shared TypeScript types for the application

export type Role = "ADMIN" | "MANAGER" | "MEMBER";

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  roleId: number;
  role: { id: number; name: Role };
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  status: string;
  ownerId: number;
  owner: Pick<User, "id" | "firstName" | "lastName" | "email">;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate?: string;
  projectId: number;
  project: Pick<Project, "id" | "name">;
  assigneeId?: number;
  assignee?: Pick<User, "id" | "firstName" | "lastName" | "email">;
  createdById: number;
  createdBy: Pick<User, "id" | "firstName" | "lastName">;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalProjects: number;
  activeProjects: number;
  totalTasks: number;
  todoTasks: number;
  inProgressTasks: number;
  completedTasks: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}
