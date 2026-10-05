import { z } from "zod";
export declare const registerSchema: z.ZodObject<{
    email: z.ZodPipe<z.ZodEmail, z.ZodTransform<string, string>>;
    password: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
}, z.core.$strip>;
export type RegisterSchemaInput = z.infer<typeof registerSchema>;
