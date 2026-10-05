import { Router } from "express";
import { register, login, refresh, getProfile, } from "../controllers/auth.controller.js";
import { authenticateAccessToken } from "../middleware/auth.middleware.js";
const router = Router();
router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.get("/profile", authenticateAccessToken, getProfile);
export default router;
//# sourceMappingURL=auth.routes.js.map