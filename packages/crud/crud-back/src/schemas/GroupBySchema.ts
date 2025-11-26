import z from "zod"
import QueryFilterRegex from "../regexs/QueryFilterRegex.js";

const GroupByQuerySchema = z.object({
    fields: z.array(z.string()).min(1).max(10),
    filters:  z.string().regex(QueryFilterRegex).optional().describe("Format: field;operator;value|field;operator;value|..."),
});


export {GroupByQuerySchema}
