import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import type { AccessTokenPayload } from "../types/token.types.js";

export const generateAccessToken = (
  userId: string,
  role: AccessTokenPayload["role"],
) => {
  const payload: AccessTokenPayload = {
    sub: userId,
    role,
  };

  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
};
