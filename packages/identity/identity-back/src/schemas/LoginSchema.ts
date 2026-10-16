import z from "zod"

const LoginBodyRequestSchema = z.object({
    username: z.string(),
    password: z.string(),
    rememberMe: z.boolean().optional(),
});

const LoginBodyResponseSchema = z.object({
    accessToken: z.string(),
    refreshToken: z.string().optional(),
    refreshExpiresAt: z.iso.datetime().optional()
});

const RefreshTokenBodyRequestSchema = z.object({
    refreshToken: z.string().min(1).max(512)
});

export {LoginBodyRequestSchema, LoginBodyResponseSchema, RefreshTokenBodyRequestSchema}
