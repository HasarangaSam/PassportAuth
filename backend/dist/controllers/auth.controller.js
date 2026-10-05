import passport from "../config/passport.js";
import { prisma } from "../lib/prisma.js";
import { registerSchema } from "../validators/auth.validator.js";
import { registerUser } from "../services/auth.service.js";
import { generateAccessToken } from "../services/token.service.js";
import { createRefreshToken, rotateRefreshToken, } from "../services/refresh-token.service.js";
import { refreshTokenCookieOptions } from "../config/cookies.js";
export const register = async (req, res) => {
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
        res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: result.error.flatten().fieldErrors,
        });
        return;
    }
    try {
        const user = await registerUser(result.data);
        res.status(201).json({
            success: true,
            message: "Account created successfully",
            data: {
                user,
            },
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "An account with this email already exists") {
            res.status(409).json({
                success: false,
                message: error.message,
            });
            return;
        }
        console.error("Registration error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};
export const login = (req, res, next) => {
    passport.authenticate("local", {
        session: false,
    }, async (error, user, info) => {
        if (error) {
            next(error);
            return;
        }
        if (!user) {
            res.status(401).json({
                success: false,
                message: info?.message ?? "Invalid email or password",
            });
            return;
        }
        try {
            req.user = user;
            const accessToken = generateAccessToken(user.id, user.role);
            const refreshToken = await createRefreshToken(user.id);
            res.cookie("refreshToken", refreshToken.token, refreshTokenCookieOptions);
            res.status(200).json({
                success: true,
                message: "Login successful",
                data: {
                    accessToken,
                    user: {
                        id: user.id,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        role: user.role,
                        emailVerified: user.emailVerified,
                    },
                },
            });
        }
        catch (error) {
            next(error);
        }
    })(req, res, next);
};
export const refresh = async (req, res, next) => {
    const rawRefreshToken = req.cookies.refreshToken;
    if (!rawRefreshToken) {
        res.status(401).json({
            success: false,
            message: "Refresh token is required",
        });
        return;
    }
    try {
        const result = await rotateRefreshToken(rawRefreshToken);
        if (!result) {
            res.status(401).json({
                success: false,
                message: "Invalid refresh token",
            });
            return;
        }
        if (result.status === "EXPIRED") {
            res.clearCookie("refreshToken", {
                ...refreshTokenCookieOptions,
                maxAge: undefined,
            });
            res.status(401).json({
                success: false,
                message: "Refresh token has expired",
            });
            return;
        }
        if (result.status === "REUSED") {
            res.clearCookie("refreshToken", {
                ...refreshTokenCookieOptions,
                maxAge: undefined,
            });
            res.status(401).json({
                success: false,
                message: "Refresh token reuse detected. Please log in again.",
            });
            return;
        }
        const user = await prisma.user.findUnique({
            where: {
                id: result.userId,
            },
        });
        if (!user) {
            res.status(401).json({
                success: false,
                message: "User not found",
            });
            return;
        }
        const accessToken = generateAccessToken(user.id, user.role);
        res.cookie("refreshToken", result.token, refreshTokenCookieOptions);
        res.status(200).json({
            success: true,
            message: "Token refreshed successfully",
            data: {
                accessToken,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
export const getProfile = (req, res) => {
    res.status(200).json({
        success: true,
        data: {
            user: {
                id: req.user.id,
                email: req.user.email,
                firstName: req.user.firstName,
                lastName: req.user.lastName,
                role: req.user.role,
                emailVerified: req.user.emailVerified,
            },
        },
    });
};
//# sourceMappingURL=auth.controller.js.map