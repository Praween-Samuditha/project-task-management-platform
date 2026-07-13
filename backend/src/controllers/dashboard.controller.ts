import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { getDashboardStats } from "../services/dashboard.service";

export const getDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const stats = await getDashboardStats();
    return res.json(stats);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
