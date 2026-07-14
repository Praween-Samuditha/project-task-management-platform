import prisma from "../config/prisma";

export const addProjectMember = async (projectId: number, userId: number) => {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new Error("Project not found");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const existingMember = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: { projectId, userId }
    }
  });

  if (existingMember) {
    throw new Error("User is already a member of this project");
  }

  return prisma.projectMember.create({
    data: {
      projectId,
      userId
    }
  });
};

export const getProjectMembers = async (projectId: number) => {
  const members = await prisma.projectMember.findMany({
    where: { projectId },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: { select: { name: true } }
        }
      }
    }
  });

  return members.map((m) => ({
    id: m.user.id,
    firstName: m.user.firstName,
    lastName: m.user.lastName,
    email: m.user.email,
    role: m.user.role.name
  }));
};

export const removeProjectMember = async (projectId: number, userId: number) => {
  return prisma.projectMember.delete({
    where: {
      projectId_userId: { projectId, userId }
    }
  });
};

export const getProjectForMemberManagement = async (projectId: number, userId: number) => {
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

