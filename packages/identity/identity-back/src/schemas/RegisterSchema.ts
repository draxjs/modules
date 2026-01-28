import z, {string, email} from "zod"

const RegisterBodyRequestSchema = z.object({
    name: string({ error: "validation.required" })
        .min(1, "validation.required"),
    username: string({ error: "validation.required" })
        .min(1, "validation.required"),
    email: email("validation.email.invalid"),
    phone: string({ error: "validation.required" }).optional(),
    password: string({ error: "validation.required" })
        .min(1, "validation.required")
        .min(8, "validation.password.min8")
        .max(64, "validation.password.max64"),
});

const RegisterBodyResponseSchema = z.object({
    success: z.boolean(),
    message: z.string().optional(),

});

export {RegisterBodyRequestSchema, RegisterBodyResponseSchema}
