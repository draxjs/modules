import z, {string, email} from "zod"

const RegisterBodyRequestSchema = z.object({
    name: string({ error: "validation.required" })
        .min(1, "validation.required"),
    username: string({ error: "validation.required" })
        .min(1, "validation.required"),
    email: email("validation.email.invalid"),
    phone: string({ error: "validation.required" }).optional(),
    tenantName: string({ error: "validation.required" }).optional(),
    password: string({ error: "validation.required" })
        .min(1, "validation.required"),
});

const RegisterBodyResponseSchema = z.object({
    success: z.boolean(),
    verificationEmailSent: z.boolean().optional(),
    message: z.string().optional(),

});

const RegistrationOptionsResponseSchema = z.object({tenantRequired: z.boolean()});

export {RegisterBodyRequestSchema, RegisterBodyResponseSchema, RegistrationOptionsResponseSchema}
