import type { Request, Response } from "express";

export const getAdminDashboard = (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the admin dashboard",
  });
};
