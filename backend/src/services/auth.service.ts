import argon2 from "argon2";

import { prisma } from "../lib/prisma.js";
import type { RegisterInput } from "../types/auth.types.js";

export const registerUser = async (input: RegisterInput) => {
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

export const authenticateUser = async (email: string, password: string) => {
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

export const changeUserPassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string,
) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user || !user.passwordHash) {
    return {
      success: false,
      reason: "INVALID_CREDENTIALS" as const,
    };
  }

  const currentPasswordValid = await argon2.verify(
    user.passwordHash,
    currentPassword,
  );

  if (!currentPasswordValid) {
    return {
      success: false,
      reason: "INVALID_CREDENTIALS" as const,
    };
  }

  const samePassword = await argon2.verify(user.passwordHash, newPassword);

  if (samePassword) {
    return {
      success: false,
      reason: "SAME_PASSWORD" as const,
    };
  }

  const passwordHash = await argon2.hash(newPassword);

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      passwordHash,
    },
  });

  return {
    success: true,
  };
};
