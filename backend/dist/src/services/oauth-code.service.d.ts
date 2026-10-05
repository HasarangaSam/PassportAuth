export declare const createOAuthCode: (userId: string) => Promise<string>;
export declare const consumeOAuthCode: (code: string) => Promise<{
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
