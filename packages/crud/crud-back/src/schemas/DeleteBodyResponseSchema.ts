import z from "zod"

const DeleteBodyResponseSchema = z.object({
    message: z.string(),
});

export default DeleteBodyResponseSchema

export {DeleteBodyResponseSchema}
