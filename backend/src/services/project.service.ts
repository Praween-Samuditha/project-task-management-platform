import prisma from "../config/prisma";

export const createProject = async (data: any, ownerId: number) => {
  return prisma.project.create({
    data: {
      ...data,
      ownerId,
    },
  });
};

export const getProjects = async (page: number, limit: number) => {
  const skip = (page - 1) * limit;
  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      skip,
      take: limit,
      include: {
        owner: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.project.count(),
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
