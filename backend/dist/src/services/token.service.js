import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
export const generateAccessToken = (userId, role) => {
    const payload = {
        sub: userId,
        role,
    };
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
        expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    });
};
//# sourceMappingURL=token.service.js.map