import z from "zod"
import QueryFilterRegex from "../regexs/QueryFilterRegex.js";

const PaginateQuerySchema = z.object({
    page: z.number().optional(),
    limit: z.number().optional(),
    orderBy: z.string().optional(),
    order: z.enum(["asc", "desc"]).optional(),
    search: z.string().optional(),
    filters:  z.string().regex(QueryFilterRegex).optional().describe("Format: field;operator;value|field;operator;value|..."),
});


const PaginateBodyResponseSchema = z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    items:  z.array(z.any())
});

export {PaginateQuerySchema, PaginateBodyResponseSchema}
