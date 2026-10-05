import type { RequestHandler } from "express";

import passport from "../config/passport.js";

export const authenticateAccessToken: RequestHandler = (req, res, next) => {
  passport.authenticate(
    "access-token",
    {
      session: false,
    },
    (error: unknown, user: Express.User | false) => {
      if (error) {
        next(error);
        return;
      }

      if (!user) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });

        return;
      }

      req.user = user;
      next();
    },
  )(req, res, next);
};
