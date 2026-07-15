import prisma from "../config/prisma";

export const createTaskAssignmentNotification = async (data: {
  userId?: number | null;
  taskId: number;
  taskTitle: string;
  projectName?: string;
  assignedById: number;
}) => {
  if (!data.userId || data.userId === data.assignedById) return null;

  return prisma.notification.create({
    data: {
      userId: data.userId,
      taskId: data.taskId,
      type: "TASK_ASSIGNED",
      title: "New task assigned",
      message: `You were assigned "${data.taskTitle}"${data.projectName ? ` in ${data.projectName}` : ""}.`,
    },
  });
};

export const getNotifications = async (userId: number) => {
  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        task: { select: { id: true, title: true, status: true, projectId: true } },
      },
    }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);

  return { notifications, unreadCount };
};

export const markNotificationRead = async (id: number, userId: number) => {
  return prisma.notification.updateMany({
    where: { id, userId },
    data: { isRead: true },
  });
};

export const markAllNotificationsRead = async (userId: number) => {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
};
