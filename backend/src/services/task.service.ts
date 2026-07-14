import prisma from "../config/prisma";

export const createTask = async (data: {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string;
  projectId: number;
  assigneeId?: number;
  createdById: number;
}) => {
  const project = await prisma.project.findUnique({ where: { id: data.projectId } });
  if (!project) throw new Error("Project not found");

  if (data.assigneeId) {
    const assignee = await getProjectForTask(data.projectId, data.assigneeId);
    if (!assignee) throw new Error("Assigned user must belong to this project");
  }

  return prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      status: data.status ?? "TODO",
      priority: data.priority ?? "MEDIUM",
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      projectId: data.projectId,
      assigneeId: data.assigneeId,
      createdById: data.createdById,
    },
    include: {
      project: { select: { id: true, name: true } },
      assignee: { select: { id: true, firstName: true, lastName: true, email: true } },
      createdBy: { select: { id: true, firstName: true, lastName: true } },
    },
  });
};

export const getAllTasks = async (filters: {
  projectId?: number;
  assigneeId?: number;
  status?: string;
  priority?: string;
  page?: number;
  limit?: number;
  accessUserId?: number;
}) => {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 10;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (filters.projectId) where.projectId = filters.projectId;
  if (filters.assigneeId) where.assigneeId = filters.assigneeId;
  if (filters.status) where.status = filters.status;
  if (filters.priority) where.priority = filters.priority;
  if (filters.accessUserId) {
    where.project = {
      OR: [
        { ownerId: filters.accessUserId },
        { members: { some: { userId: filters.accessUserId } } },
      ],
    };
  }

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, firstName: true, lastName: true, email: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
    }),
    prisma.task.count({ where }),
  ]);

  return {
    tasks,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getTaskById = async (id: number) => {
  return prisma.task.findUnique({
    where: { id },
    include: {
      project: { select: { id: true, name: true } },
      assignee: { select: { id: true, firstName: true, lastName: true, email: true } },
      createdBy: { select: { id: true, firstName: true, lastName: true } },
    },
  });
};

export const updateTask = async (
  id: number,
  data: {
    title?: string;
    description?: string;
    status?: string;
    priority?: string;
    dueDate?: string | null;
    assigneeId?: number | null;
    projectId?: number;
  }
) => {
  const existingTask = await prisma.task.findUnique({ where: { id }, select: { projectId: true } });
  if (!existingTask) throw new Error("Task not found");

  if (data.assigneeId) {
    const assignee = await getProjectForTask(data.projectId ?? existingTask.projectId, data.assigneeId);
    if (!assignee) throw new Error("Assigned user must belong to this project");
  }

  return prisma.task.update({
    where: { id },
    data: {
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate) : data.dueDate === null ? null : undefined,
    },
    include: {
      project: { select: { id: true, name: true } },
      assignee: { select: { id: true, firstName: true, lastName: true, email: true } },
      createdBy: { select: { id: true, firstName: true, lastName: true } },
    },
  });
};

export const deleteTask = async (id: number) => {
  return prisma.task.delete({ where: { id } });
};

// Returns the project if the user owns it or is a member, otherwise null
export const getProjectForTask = async (projectId: number, userId: number) => {
  return prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [
        { ownerId: userId },
        { members: { some: { userId } } },
      ],
    },
  });
};

