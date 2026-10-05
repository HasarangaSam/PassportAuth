import { createHash, randomBytes } from "node:crypto";
export const generateRefreshToken = () => {
    return randomBytes(64).toString("base64url");
};
export const hashRefreshToken = (token) => {
    return createHash("sha256").update(token).digest("hex");
};
export const generateTokenFamilyId = () => {
    return randomBytes(32).toString("hex");
};
//# sourceMappingURL=refresh-token.js.map