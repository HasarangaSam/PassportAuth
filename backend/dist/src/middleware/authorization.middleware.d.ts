import type { RequestHandler } from "express";
import type { Role } from "../../generated/prisma/client.js";
export declare const requireRole: (...allowedRoles: Role[]) => RequestHandler;
