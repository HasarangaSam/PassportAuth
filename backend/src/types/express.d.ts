import type { Role } from "../../generated/prisma/client.js";

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      passwordHash: string | null;
      role: Role;
      emailVerified: boolean;
      createdAt: Date;
      updatedAt: Date;
    }
  }
}

export {};
