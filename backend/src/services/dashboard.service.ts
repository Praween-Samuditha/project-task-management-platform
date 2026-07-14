import prisma from "../config/prisma";

export const getDashboardStats = async (memberId?: number, managerId?: number) => {
  // MEMBER: tasks assigned to them; MANAGER: tasks/projects they own or are member of; ADMIN: all
  const taskWhere = memberId ? { assigneeId: memberId } : {};

  const projectWhere = managerId
    ? { OR: [{ ownerId: managerId }, { members: { some: { userId: managerId } } }] }
    : {};

  const projectIds = managerId
    ? (await prisma.project.findMany({ where: projectWhere, select: { id: true } })).map(p => p.id)
    : undefined;

  const managerTaskWhere = projectIds ? { projectId: { in: projectIds } } : {};
  const finalTaskWhere = memberId ? taskWhere : managerTaskWhere;

  const [totalUsers, totalProjects, activeProjects, totalTasks, todoTasks, inProgressTasks, completedTasks] =
    await Promise.all([
      memberId ? 0 : managerId ? 0 : prisma.user.count(),
      memberId ? 0 : prisma.project.count({ where: projectWhere }),
      memberId ? 0 : prisma.project.count({ where: { ...projectWhere, status: "ACTIVE" } }),
      prisma.task.count({ where: finalTaskWhere }),
      prisma.task.count({ where: { ...finalTaskWhere, status: "TODO" } }),
      prisma.task.count({ where: { ...finalTaskWhere, status: "IN_PROGRESS" } }),
      prisma.task.count({ where: { ...finalTaskWhere, status: "DONE" } }),
    ]);

  return { totalUsers, totalProjects, activeProjects, totalTasks, todoTasks, inProgressTasks, completedTasks };
};
