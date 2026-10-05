import { Router } from "express";

import { getAdminDashboard } from "../controllers/admin.controller.js";
import { authenticateAccessToken } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/authorization.middleware.js";

const router = Router();

router.get(
  "/dashboard",
  authenticateAccessToken,
  requireRole("ADMIN"),
  getAdminDashboard,
);

export default router;
