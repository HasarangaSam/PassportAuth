import type { NextFunction, Request, Response } from "express";
export declare const register: (req: Request, res: Response) => Promise<void>;
export declare const login: (req: Request, res: Response, next: NextFunction) => void;
export declare const refresh: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getProfile: (req: Request, res: Response) => void;
