import { object, string,  record, any, iso } from "zod"

const TenantBaseSchema = object({
    name: string({ error: "validation.required" })
        .min(1, "validation.required")
        //.regex(/^[A-Z]/, "validation.startWithUpperCase"),
})


const TenantSchema = TenantBaseSchema.extend({
    _id: string(),
    id: string().optional(),
    custom: record(string(), any()).optional(),
    createdAt: iso.datetime().optional(),
    updatedAt: iso.datetime().optional()
});



export {
    TenantSchema,
    TenantBaseSchema
}
