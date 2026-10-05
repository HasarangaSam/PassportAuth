import { Router } from "express";

import {
  register,
  login,
  refresh,
  logout,
  logoutAllDevices,
  changePassword,
  googleLogin,
  googleCallback,
  getProfile,
  exchangeOAuthCode,
} from "../controllers/auth.controller.js";

import { authenticateAccessToken } from "../middleware/auth.middleware.js";

import { validateOrigin } from "../middleware/csrf.middleware.js";

const router = Router();

router.post("/register", register);

router.post("/login", login);

router.post("/refresh", validateOrigin, refresh);

router.post("/logout", validateOrigin, logout);

router.post(
  "/logout-all",
  validateOrigin,
  authenticateAccessToken,
  logoutAllDevices,
);

router.post(
  "/change-password",
  validateOrigin,
  authenticateAccessToken,
  changePassword,
);

router.get("/google", googleLogin);

router.get("/google/callback", googleCallback);

router.post("/google/exchange", validateOrigin, exchangeOAuthCode);

router.get("/profile", authenticateAccessToken, getProfile);

export default router;
