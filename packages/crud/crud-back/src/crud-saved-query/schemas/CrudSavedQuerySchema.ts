import {z} from "zod";

const CrudSavedQueryFieldFilterSchema = z.object({
    field: z.string().min(1, "validation.required"),
    operator: z.string().optional().default("eq"),
    value: z.any().optional().nullable(),
    orGroup: z.string().optional()
});

const CrudSavedQueryDynamicFilterSchema = z.object({
    default: z.any().optional().nullable(),
    label: z.string().optional(),
    name: z.string().min(1, "validation.required"),
    operator: z.string().optional().default("eq"),
    type: z.string().optional().default("string"),
    permission: z.string().optional(),
    value: z.any().optional().nullable(),
    ref: z.string().optional(),
    refDisplay: z.string().optional(),
    enum: z.array(z.any()).optional()
}).catchall(z.any());

const CrudSavedQueryBaseSchema = z.object({
    entity: z.string().min(1, "validation.required"),
    name: z.string().min(1, "validation.required"),
    shared: z.boolean().optional().default(false),
    columns: z.array(z.string()).optional().default([]),
    staticFilters: z.array(CrudSavedQueryFieldFilterSchema).optional().default([]),
    dynamicFilters: z.array(CrudSavedQueryDynamicFilterSchema).optional().default([]),
    tenant: z.coerce.string().optional().nullable(),
    user: z.coerce.string().optional().nullable()
});

const CrudSavedQuerySchema = CrudSavedQueryBaseSchema.extend({
    _id: z.coerce.string(),
    tenant: z.object({_id: z.coerce.string(), name: z.string()}).nullable().optional(),
    user: z.object({_id: z.coerce.string(), username: z.string()}).nullable().optional()
});

export default CrudSavedQuerySchema;
export {CrudSavedQuerySchema, CrudSavedQueryBaseSchema};
