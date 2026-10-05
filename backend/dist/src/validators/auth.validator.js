import { z } from "zod";
export const registerSchema = z.object({
    email: z.email().transform((value) => value.toLowerCase().trim()),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .max(128, "Password must not exceed 128 characters"),
    firstName: z
        .string()
        .trim()
        .min(1, "First name is required")
        .max(50, "First name must not exceed 50 characters"),
    lastName: z
        .string()
        .trim()
        .min(1, "Last name is required")
        .max(50, "Last name must not exceed 50 characters"),
});
export const changePasswordSchema = z
    .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
        .string()
        .min(8, "New password must be at least 8 characters long")
        .max(128, "New password must not exceed 128 characters"),
    confirmPassword: z.string().min(1, "Password confirmation is required"),
})
    .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});
//# sourceMappingURL=auth.validator.js.map