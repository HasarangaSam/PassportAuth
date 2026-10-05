import { createHash, randomBytes } from "node:crypto";
import { prisma } from "../lib/prisma.js";
const OAUTH_CODE_EXPIRATION_SECONDS = 60;
const hashCode = (code) => {
    return createHash("sha256").update(code).digest("hex");
};
const generateCode = () => {
    return randomBytes(32).toString("base64url");
};
export const createOAuthCode = async (userId) => {
    const code = generateCode();
    const codeHash = hashCode(code);
    const expiresAt = new Date(Date.now() + OAUTH_CODE_EXPIRATION_SECONDS * 1000);
    await prisma.oAuthCode.create({
        data: {
            codeHash,
            userId,
            expiresAt,
        },
    });
    return code;
};
export const consumeOAuthCode = async (code) => {
    const codeHash = hashCode(code);
    return prisma.$transaction(async (tx) => {
        const oauthCode = await tx.oAuthCode.findUnique({
            where: {
                codeHash,
            },
        });
        if (!oauthCode) {
            return null;
        }
        if (oauthCode.expiresAt <= new Date()) {
            await tx.oAuthCode.delete({
                where: {
                    id: oauthCode.id,
                },
            });
            return null;
        }
        await tx.oAuthCode.delete({
            where: {
                id: oauthCode.id,
            },
        });
        return tx.user.findUnique({
            where: {
                id: oauthCode.userId,
            },
        });
    });
};
//# sourceMappingURL=oauth-code.service.js.map