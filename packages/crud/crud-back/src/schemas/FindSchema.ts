import z from "zod"

const FindQuerySchema = z.object({
    orderBy: z.string().optional(),
    order: z.enum(["asc", "desc"]).optional(),
    search: z.string().optional(),
    filters:  z.array(z.object({
        field: z.string(),
        operator: z.string(),
        value: z.any(),
    })).optional()
});


export {FindQuerySchema}
