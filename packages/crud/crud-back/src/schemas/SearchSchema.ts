import z from "zod"

const SearchQuerySchema = z.object({
    search: z.string().optional(),
});


export {SearchQuerySchema}
