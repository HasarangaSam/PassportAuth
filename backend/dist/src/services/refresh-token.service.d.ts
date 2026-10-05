export declare const createRefreshToken: (userId: string, familyId?: string) => Promise<{
    id: string;
    token: string;
    familyId: string;
    expiresAt: Date;
}>;
export declare const rotateRefreshToken: (rawToken: string) => Promise<{
    status: "REUSED";
    familyId: string;
    userId: string;
    token?: undefined;
    expiresAt?: undefined;
} | {
    status: "EXPIRED";
    familyId: string;
    userId: string;
    token?: undefined;
    expiresAt?: undefined;
} | {
    status: "ROTATED";
    userId: string;
    familyId: string;
    token: string;
    expiresAt: Date;
} | null>;
export declare const revokeTokenFamily: (familyId: string) => Promise<void>;
export declare const revokeRefreshToken: (rawToken: string) => Promise<void>;
export declare const revokeAllUserRefreshTokens: (userId: string) => Promise<void>;
