import type { AccessTokenPayload } from "../types/token.types.js";
export declare const generateAccessToken: (userId: string, role: AccessTokenPayload["role"]) => string;
