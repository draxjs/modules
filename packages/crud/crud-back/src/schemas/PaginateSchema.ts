import z from "zod"

const PaginateQuerySchema = z.object({
    page: z.number().optional(),
    limit: z.number().optional(),
    orderBy: z.string().optional(),
    order: z.enum(["asc", "desc"]).optional(),
    search: z.string().optional(),
    filters:  z.array(z.object({
        field: z.string(),
        operator: z.string(),
        value: z.any(),
    })).optional()
});


const PaginateBodyResponseSchema = z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    items:  z.array(z.any())
});

export {PaginateQuerySchema, PaginateBodyResponseSchema}
