import type { RequestHandler } from "express";

import type { Role } from "../../generated/prisma/client.js";

export const requireRole = (...allowedRoles: Role[]): RequestHandler => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });

      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: "Forbidden",
      });

      return;
    }

    next();
  };
};
