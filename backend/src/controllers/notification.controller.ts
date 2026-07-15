import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import * as notificationService from "../services/notification.service";

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const result = await notificationService.getNotifications(req.user.id);
    return res.json(result);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const markNotificationRead = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    await notificationService.markNotificationRead(id, req.user.id);
    return res.json({ message: "Notification marked as read" });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const markAllNotificationsRead = async (req: AuthRequest, res: Response) => {
  try {
    await notificationService.markAllNotificationsRead(req.user.id);
    return res.json({ message: "Notifications marked as read" });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};
