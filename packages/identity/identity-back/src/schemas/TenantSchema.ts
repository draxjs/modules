import { object, string, date } from "zod"

const TenantBaseSchema = object({
    name: string({ required_error: "validation.required" })
        .min(1, "validation.required")
        .regex(/^[A-Z]/, "validation.startWithUpperCase"),
})


const TenantSchema = TenantBaseSchema.extend({
    _id: string(),
    id: string().optional(),
    createdAt: date(),
    updatedAt: date()
});



export {
    TenantSchema,
    TenantBaseSchema
}
