import { env } from "./env.js";
export const refreshTokenCookieOptions = {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth",
    maxAge: env.REFRESH_TOKEN_EXPIRES_IN_DAYS *
        24 *
        60 *
        60 *
        1000,
};
//# sourceMappingURL=cookies.js.map