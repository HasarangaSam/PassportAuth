import type { RegisterInput } from "../types/auth.types.js";
export declare const registerUser: (input: RegisterInput) => Promise<{
    createdAt: Date;
    email: string;
    emailVerified: boolean;
    firstName: string;
    id: string;
    lastName: string;
    role: import("../../generated/prisma/enums.js").Role;
}>;
export declare const authenticateUser: (email: string, password: string) => Promise<{
    id: string;
    email: string;
    passwordHash: string | null;
    firstName: string;
    lastName: string;
    role: import("../../generated/prisma/enums.js").Role;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
} | null>;
