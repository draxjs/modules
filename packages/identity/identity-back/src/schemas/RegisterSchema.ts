import z, {string} from "zod"

const RegisterBodyRequestSchema = z.object({
    name: string({ required_error: "validation.required" })
        .min(1, "validation.required"),
    username: string({ required_error: "validation.required" })
        .min(1, "validation.required"),
    email: string({ required_error: "validation.required" })
        .email("validation.email.invalid"),
    phone: string({ required_error: "validation.required" }).optional(),
    password: string({ required_error: "validation.required" })
        .min(1, "validation.required")
        .min(8, "validation.password.min8")
        .max(64, "validation.password.max64"),
});

const RegisterBodyResponseSchema = z.object({
    success: z.boolean(),
    message: z.string().optional(),

});

export {RegisterBodyRequestSchema, RegisterBodyResponseSchema}
