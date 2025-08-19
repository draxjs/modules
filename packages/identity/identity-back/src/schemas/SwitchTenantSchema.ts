import z from "zod"

const SwitchTenantBodyRequestSchema = z.object({
    tenantId: z.string(),
});

const SwitchTenantBodyResponseSchema = z.object({
    accessToken: z.string()
});

export {SwitchTenantBodyRequestSchema, SwitchTenantBodyResponseSchema}
