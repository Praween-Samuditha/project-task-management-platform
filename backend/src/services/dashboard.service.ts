import prisma from "../config/prisma";

export const getDashboardStats = async () => {
  const [
    totalUsers,
    totalProjects,
    activeProjects,
    completedProjects,
    totalTasks,
    completedTasks,
    inProgressTasks,
    todoTasks,
    inReviewTasks,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.project.count(),
    prisma.project.count({ where: { status: "ACTIVE" } }),
    prisma.project.count({ where: { status: "COMPLETED" } }),
    prisma.task.count(),
    prisma.task.count({ where: { status: "DONE" } }),
    prisma.task.count({ where: { status: "IN_PROGRESS" } }),
    prisma.task.count({ where: { status: "TODO" } }),
    prisma.task.count({ where: { status: "IN_REVIEW" } }),
  ]);

  // Recent tasks (last 5)
  const recentTasks = await prisma.task.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      project: { select: { id: true, name: true } },
      assignee: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  // Recent projects (last 5)
  const recentProjects = await prisma.project.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      status: true,
      createdAt: true,
      _count: { select: { tasks: true, members: true } },
    },
  });

  return {
    stats: {
      users: { total: totalUsers },
      projects: {
        total: totalProjects,
        active: activeProjects,
        completed: completedProjects,
        planning: totalProjects - activeProjects - completedProjects,
      },
      tasks: {
        total: totalTasks,
        todo: todoTasks,
        inProgress: inProgressTasks,
        inReview: inReviewTasks,
        done: completedTasks,
      },
    },
    recentTasks,
    recentProjects,
  };
};
