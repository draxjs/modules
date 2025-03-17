import { object, string, date } from "zod"

const TenantBaseSchema = object({
    name: string({ required_error: "validation.required" })
        .min(1, "validation.required")
        .regex(/^[A-Z]/, "validation.startWithUpperCase"),
})


const TenantSchema = TenantBaseSchema.extend({
    id: string(),
    createdAt: date(),
    updatedAt: date()
});

const TenantByNameSchema = object({
    name: string()
});


export {
    TenantSchema,
    TenantBaseSchema,
    TenantByNameSchema
}
