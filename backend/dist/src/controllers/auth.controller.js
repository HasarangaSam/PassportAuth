import passport from "../config/passport.js";
import { prisma } from "../lib/prisma.js";
import { changePasswordSchema, registerSchema, } from "../validators/auth.validator.js";
import { registerUser, changeUserPassword } from "../services/auth.service.js";
import { generateAccessToken } from "../services/token.service.js";
import { createRefreshToken, rotateRefreshToken, revokeRefreshToken, revokeAllUserRefreshTokens, } from "../services/refresh-token.service.js";
import { refreshTokenCookieOptions } from "../config/cookies.js";
import { env } from "../config/env.js";
import { createOAuthCode } from "../services/oauth-code.service.js";
import { consumeOAuthCode } from "../services/oauth-code.service.js";
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
    const user = req.user;
    if (!user) {
        res.status(401).json({
            success: false,
            message: "Authentication required",
        });
        return;
    }
    res.status(200).json({
        success: true,
        data: {
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
};
export const logout = async (req, res, next) => {
    const rawRefreshToken = req.cookies.refreshToken;
    try {
        if (rawRefreshToken) {
            await revokeRefreshToken(rawRefreshToken);
        }
        res.clearCookie("refreshToken", {
            ...refreshTokenCookieOptions,
            maxAge: undefined,
        });
        res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });
    }
    catch (error) {
        next(error);
    }
};
export const logoutAllDevices = async (req, res, next) => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
        return;
    }
    try {
        await revokeAllUserRefreshTokens(req.user.id);
        res.clearCookie("refreshToken", {
            ...refreshTokenCookieOptions,
            maxAge: undefined,
        });
        res.status(200).json({
            success: true,
            message: "Logged out from all devices successfully",
        });
    }
    catch (error) {
        next(error);
    }
};
export const changePassword = async (req, res, next) => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
        return;
    }
    const result = changePasswordSchema.safeParse(req.body);
    if (!result.success) {
        res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: result.error.flatten().fieldErrors,
        });
        return;
    }
    try {
        const passwordResult = await changeUserPassword(req.user.id, result.data.currentPassword, result.data.newPassword);
        if (!passwordResult.success &&
            passwordResult.reason === "INVALID_CREDENTIALS") {
            res.status(401).json({
                success: false,
                message: "Current password is incorrect",
            });
            return;
        }
        if (!passwordResult.success && passwordResult.reason === "SAME_PASSWORD") {
            res.status(400).json({
                success: false,
                message: "New password must be different from your current password",
            });
            return;
        }
        // Password changes invalidate every existing refresh-token session.
        await revokeAllUserRefreshTokens(req.user.id);
        res.clearCookie("refreshToken", {
            ...refreshTokenCookieOptions,
            maxAge: undefined,
        });
        res.status(200).json({
            success: true,
            message: "Password changed successfully. Please log in again on your devices.",
        });
    }
    catch (error) {
        next(error);
    }
};
export const googleLogin = passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
});
export const googleCallback = (req, res, next) => {
    passport.authenticate("google", {
        session: false,
    }, async (error, user) => {
        if (error) {
            next(error);
            return;
        }
        if (!user) {
            res.redirect(`${env.CLIENT_URL}/login?error=google_auth_failed`);
            return;
        }
        try {
            const code = await createOAuthCode(user.id);
            res.redirect(`${env.CLIENT_URL}/oauth/callback?code=${encodeURIComponent(code)}`);
        }
        catch (callbackError) {
            next(callbackError);
        }
    })(req, res, next);
};
export const exchangeOAuthCode = async (req, res) => {
    const code = typeof req.body.code === "string" ? req.body.code : "";
    if (!code) {
        res.status(400).json({
            success: false,
            message: "OAuth code is required",
        });
        return;
    }
    const user = await consumeOAuthCode(code);
    if (!user) {
        res.status(401).json({
            success: false,
            message: "Invalid or expired OAuth code",
        });
        return;
    }
    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = await createRefreshToken(user.id);
    res.cookie("refreshToken", refreshToken.token, refreshTokenCookieOptions);
    res.status(200).json({
        success: true,
        accessToken,
        user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            emailVerified: user.emailVerified,
            createdAt: user.createdAt,
        },
    });
};
//# sourceMappingURL=auth.controller.js.map