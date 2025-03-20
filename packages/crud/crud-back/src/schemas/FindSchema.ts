import z from "zod"
import QueryFilterRegex from "../regexs/QueryFilterRegex.js";


const FindQuerySchema = z.object({
    orderBy: z.string().optional(),
    order: z.enum(["asc", "desc"]).optional(),
    search: z.string().optional(),
    filters:  z.string().regex(QueryFilterRegex).optional().describe("Format: field;operator;value|field;operator;value|..."),
});


export {FindQuerySchema}
