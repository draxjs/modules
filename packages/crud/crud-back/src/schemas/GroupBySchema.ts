import z from "zod"
import QueryFilterRegex from "../regexs/QueryFilterRegex.js";

const GroupByQuerySchema = z.object({
    fields: z.array(z.string()).min(1).max(10),
    dateFormat: z.enum(['year', 'month', 'week', 'day', 'hour', 'minute', 'second']).optional(),
    filters:  z.string().regex(QueryFilterRegex).optional().describe("Format: field;operator;value[;orGroup]|field;operator;value[;orGroup]|..."),
});


export {GroupByQuerySchema}
