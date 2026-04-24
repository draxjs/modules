import z from "zod";

const PasswordPolicySchemaBase = z.object({
    minLength: z.number().int().min(1),
    maxLength: z.number().int().min(1),
    requireUppercase: z.boolean(),
    requireLowercase: z.boolean(),
    requireNumber: z.boolean(),
    requireSpecialChar: z.boolean(),
    allowedSpecialChars: z.string(),
    disallowSpaces: z.boolean(),
    preventReuse: z.number().int().min(0),
    expirationDays: z.number().int().min(1).nullable(),
})

const PasswordPolicySchema = PasswordPolicySchemaBase.refine((
        policy) =>
        policy.maxLength >= policy.minLength,
    {
        message: "validation.password.maxLength",
        path: ["maxLength"]
    }
);

const PartialPasswordPolicySchema = PasswordPolicySchemaBase.partial();

export {
    PasswordPolicySchema,
    PartialPasswordPolicySchema
}
