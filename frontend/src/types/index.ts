export type Role = "ADMIN" | "MANAGER" | "MEMBER";

export interface RoleObj {
  id: number;
  name: Role;
  description?: string;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  roleId: number;
  role: RoleObj;
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
  _count?: { tasks: number; members: number };
  members?: Array<{
    user: Pick<User, "id" | "firstName" | "lastName" | "email" | "role">;
  }>;
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
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

export interface ProjectMember {
  id: number;
  projectId: number;
  userId: number;
  user: Pick<User, "id" | "firstName" | "lastName" | "email" | "role">;
  createdAt: string;
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

export interface PaginatedResponse<T> {
  data?: T[];
  tasks?: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface DecodedToken {
  id: number;
  email: string;
  role: Role;
  iat: number;
  exp: number;
}
