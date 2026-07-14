// ── New backend API types (separate from existing types/index.ts) ─────────────

export type NewRole = "ADMIN" | "PROJECT_MANAGER" | "TEAM_MEMBER";

export interface NewUser {
  id: string;
  name: string;
  email: string;
  role: NewRole;
  createdAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse extends AuthTokens {
  user: NewUser;
}

export interface NewProject {
  id: string;
  name: string;
  description?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  members?: ProjectMemberEntry[];
  _count?: { tasks: number; members: number };
}

export interface ProjectMemberEntry {
  userId: string;
  user: Pick<NewUser, "id" | "name" | "email" | "role">;
}

export type NewTaskStatus = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
export type NewTaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface NewTask {
  id: string;
  title: string;
  description?: string;
  status: NewTaskStatus;
  priority: NewTaskPriority;
  dueDate?: string;
  projectId: string;
  assigneeId?: string;
  assignee?: Pick<NewUser, "id" | "name" | "email">;
  createdById?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  user: Pick<NewUser, "id" | "name">;
  body: string;
  createdAt: string;
}

export interface DashboardSummary {
  scope: "ADMIN" | "PROJECT_MANAGER" | "TEAM_MEMBER";
  totalUsers?: number;
  totalProjects?: number;
  activeProjects?: number;
  totalTasks?: number;
  myTasks?: number;
  todoTasks?: number;
  inProgressTasks?: number;
  completedTasks?: number;
  overdueTasks?: number;
}

export interface ApiError {
  error: string;
  details?: unknown;
}
