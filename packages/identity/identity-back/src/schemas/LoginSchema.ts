import z from "zod"

const LoginBodyRequestSchema = z.object({
    username: z.string(),
    password: z.string(),
});

const LoginBodyResponseSchema = z.object({
    accessToken: z.string()
});

export {LoginBodyRequestSchema, LoginBodyResponseSchema}
