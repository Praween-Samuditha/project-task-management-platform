import prisma from "../config/prisma";

export const createProject = async (data: any, ownerId: number) => {
  return prisma.project.create({
    data: {
      ...data,
      ownerId,
    },
  });
};

export const getProjects = async (page: number, limit: number, memberId?: number) => {
  const skip = (page - 1) * limit;
  const where = memberId
    ? {
        OR: [
          { ownerId: memberId },
          { members: { some: { userId: memberId } } },
        ],
      }
    : {};

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      skip,
      take: limit,
      include: {
        owner: {
          select: { id: true, firstName: true, lastName: true },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: { select: { name: true } },
              },
            },
          },
        },
        _count: {
          select: {
            tasks: true,
            members: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.project.count({ where }),
  ]);

  return {
    data: projects,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getProjectById = async (id: number) => {
  return prisma.project.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, firstName: true, lastName: true } },
      members: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
    },
  });
};

export const updateProject = async (id: number, data: any) => {
  return prisma.project.update({
    where: { id },
    data,
  });
};

export const deleteProject = async (id: number) => {
  return prisma.project.delete({
    where: { id },
  });
};
