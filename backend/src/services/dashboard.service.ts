import prisma from "../config/prisma";

export const getDashboardStats = async () => {
  const totalUsers = await prisma.user.count();

  const totalProjects = await prisma.project.count();

  const activeProjects = await prisma.project.count({
    where: {
      status: "ACTIVE",
    },
  });

  const totalTasks = await prisma.task.count();

  const todoTasks = await prisma.task.count({
    where: {
      status: "TODO",
    },
  });

  const inProgressTasks = await prisma.task.count({
    where: {
      status: "IN_PROGRESS",
    },
  });

  const completedTasks = await prisma.task.count({
    where: {
      status: "DONE",
    },
  });

  return {
    totalUsers,
    totalProjects,
    activeProjects,
    totalTasks,
    todoTasks,
    inProgressTasks,
    completedTasks,
  };
};
