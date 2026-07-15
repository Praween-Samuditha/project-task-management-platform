import api from "./api";
import { NotificationsResponse } from "@/types";

export const getNotifications = () =>
  api.get<NotificationsResponse>("/notifications").then((r) => r.data);

export const markNotificationRead = (id: number) =>
  api.patch(`/notifications/${id}/read`).then((r) => r.data);

export const markAllNotificationsRead = () =>
  api.patch("/notifications/read-all").then((r) => r.data);
