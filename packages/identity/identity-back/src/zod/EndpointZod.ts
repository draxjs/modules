import z from "zod"

const loginBodyRequestSchema = z.object({
    username: z.string(),
    password: z.string(),
});

const loginBodyResponseSchema = z.object({
    accessToken: z.string()
});

export {loginBodyRequestSchema, loginBodyResponseSchema}
