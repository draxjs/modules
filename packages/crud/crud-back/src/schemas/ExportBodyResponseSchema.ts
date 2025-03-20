import z from "zod"

const ExportBodyResponseSchema = z.object({
    url: z.string(),
    rowCount: z.number(),
    time: z.number(),
    fileName: z.string(),
});

export default ExportBodyResponseSchema

export {ExportBodyResponseSchema}
