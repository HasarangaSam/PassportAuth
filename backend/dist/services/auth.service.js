import argon2 from "argon2";
import { prisma } from "../lib/prisma.js";
export const registerUser = async (input) => {
    const existingUser = await prisma.user.findUnique({
        where: {
            email: input.email,
        },
    });
    if (existingUser) {
        throw new Error("An account with this email already exists");
    }
    const passwordHash = await argon2.hash(input.password);
    const user = await prisma.user.create({
        data: {
            email: input.email,
            passwordHash,
            firstName: input.firstName,
            lastName: input.lastName,
        },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            emailVerified: true,
            createdAt: true,
        },
    });
    return user;
};
export const authenticateUser = async (email, password) => {
    const user = await prisma.user.findUnique({
        where: {
            email: email.toLowerCase().trim(),
        },
    });
    if (!user || !user.passwordHash) {
        return null;
    }
    const passwordValid = await argon2.verify(user.passwordHash, password);
    if (!passwordValid) {
        return null;
    }
    return user;
};
//# sourceMappingURL=auth.service.js.map