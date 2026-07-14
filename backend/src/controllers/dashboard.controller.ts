import { Request, Response } from "express";
import * as dashboardService from "../services/dashboard.service";
import { AuthRequest } from "../middleware/auth.middleware";

export const getDashboardStats = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    const stats = await dashboardService.getDashboardStats(
      role === "MEMBER" ? userId : undefined,
      role === "MANAGER" ? userId : undefined
    );
    return res.status(200).json(stats);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch dashboard statistics." });
  }
};
