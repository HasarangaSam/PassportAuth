import { env } from "./env.js";
export const refreshTokenCookieOptions = {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth",
    maxAge: 7 * 24 * 60 * 60 * 1000,
};
//# sourceMappingURL=cookies.js.map