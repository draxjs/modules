import z from "zod"

const DeleteBodyResponseSchema = z.object({
    id: z.string(),
    deleted: z.boolean(),
    deletedAt: z.string(),
    message: z.string()
});

export default DeleteBodyResponseSchema

export {DeleteBodyResponseSchema}
