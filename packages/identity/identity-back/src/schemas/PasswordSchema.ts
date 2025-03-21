import z from "zod"

const MyPasswordBodyRequestSchema = z.object({
    currentPassword: z.string(),
    newPassword: z.string(),
});

const PasswordBodyRequestSchema = z.object({
    newPassword: z.string()
});

const PasswordBodyResponseSchema = z.object({
    message: z.string()
});

export {MyPasswordBodyRequestSchema, PasswordBodyRequestSchema, PasswordBodyResponseSchema}
