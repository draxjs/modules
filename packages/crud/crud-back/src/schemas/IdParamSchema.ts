import z from "zod"

const IdParamSchema = z.object({
    id: z.string().min(1, "validation.required")
});

export default IdParamSchema

export {IdParamSchema}
