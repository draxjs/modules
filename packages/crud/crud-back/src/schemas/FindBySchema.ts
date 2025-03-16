import z from "zod"

const FindByParamSchema = z.object({
    value: z.string(),
    field: z.string(),
});


export {FindByParamSchema}
