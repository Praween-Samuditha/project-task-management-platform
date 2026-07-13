import { Request, Response } from "express";
import * as dashboardService from "../services/dashboard.service";

export const getDashboardStats = async (
  req: Request,
  res: Response
) => {
  try {
    const stats = await dashboardService.getDashboardStats();

    return res.status(200).json(stats);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to fetch dashboard statistics.",
    });
  }
};
