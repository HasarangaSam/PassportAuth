import { prisma } from "../lib/prisma.js";
import { generateRefreshToken, generateTokenFamilyId, hashRefreshToken, } from "../utils/refresh-token.js";
const REFRESH_TOKEN_EXPIRATION_DAYS = 7;
const getExpirationDate = () => {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRATION_DAYS);
    return expiresAt;
};
export const createRefreshToken = async (userId, familyId = generateTokenFamilyId()) => {
    const rawToken = generateRefreshToken();
    const tokenHash = hashRefreshToken(rawToken);
    const expiresAt = getExpirationDate();
    const refreshToken = await prisma.refreshToken.create({
        data: {
            tokenHash,
            familyId,
            userId,
            expiresAt,
        },
    });
    return {
        id: refreshToken.id,
        token: rawToken,
        familyId,
        expiresAt,
    };
};
export const rotateRefreshToken = async (rawToken) => {
    const tokenHash = hashRefreshToken(rawToken);
    return prisma.$transaction(async (tx) => {
        const existingToken = await tx.refreshToken.findUnique({
            where: {
                tokenHash,
            },
        });
        if (!existingToken) {
            return null;
        }
        if (existingToken.revokedAt) {
            await tx.refreshToken.updateMany({
                where: {
                    familyId: existingToken.familyId,
                    revokedAt: null,
                },
                data: {
                    revokedAt: new Date(),
                },
            });
            return {
                status: "REUSED",
                familyId: existingToken.familyId,
                userId: existingToken.userId,
            };
        }
        if (existingToken.expiresAt <= new Date()) {
            return {
                status: "EXPIRED",
                familyId: existingToken.familyId,
                userId: existingToken.userId,
            };
        }
        const newRawToken = generateRefreshToken();
        const newTokenHash = hashRefreshToken(newRawToken);
        const newExpiresAt = getExpirationDate();
        const newToken = await tx.refreshToken.create({
            data: {
                tokenHash: newTokenHash,
                familyId: existingToken.familyId,
                userId: existingToken.userId,
                expiresAt: newExpiresAt,
            },
        });
        const revokedToken = await tx.refreshToken.updateMany({
            where: {
                id: existingToken.id,
                revokedAt: null,
            },
            data: {
                revokedAt: new Date(),
                replacedById: newToken.id,
            },
        });
        if (revokedToken.count !== 1) {
            throw new Error("Refresh token rotation conflict");
        }
        return {
            status: "ROTATED",
            userId: existingToken.userId,
            familyId: existingToken.familyId,
            token: newRawToken,
            expiresAt: newExpiresAt,
        };
    }, {
        isolationLevel: "Serializable",
    });
};
export const revokeTokenFamily = async (familyId) => {
    await prisma.refreshToken.updateMany({
        where: {
            familyId,
            revokedAt: null,
        },
        data: {
            revokedAt: new Date(),
        },
    });
};
//# sourceMappingURL=refresh-token.service.js.map