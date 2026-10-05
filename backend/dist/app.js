import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import passport from "./config/passport.js";
import authRoutes from "./routes/auth.routes.js";
const app = express();
app.use(cors({
    origin: env.CLIENT_URL,
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());
app.get("/api/health", (_req, res) => {
    res.status(200).json({
        success: true,
        message: "PassportAuth API is running",
    });
});
app.use("/api/auth", authRoutes);
export default app;
//# sourceMappingURL=app.js.map