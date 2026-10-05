import type { RequestHandler } from "express";

import { env } from "../config/env.js";

export const validateOrigin: RequestHandler = (req, res, next) => {
  const origin = req.get("origin");

  if (!origin) {
    next();
    return;
  }

  if (origin !== env.CLIENT_URL) {
    res.status(403).json({
      success: false,
      message: "Invalid request origin",
    });

    return;
  }

  next();
};
