import z from "zod"

const settingSchema = z.object({
    key: z.string({error: "validation.required"}).min(1, "validation.required"),
    label: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    category: z.string().optional().nullable(),
    type: z.enum(['string','longString','number','enum','boolean', 'password', 'stringList','numberList', 'enumList', 'ref', 'secret']),
    regex: z.string().optional().nullable(),
    entity: z.string().optional().nullable(),
    entityValue: z.string().optional().nullable(),
    entityText: z.string().optional().nullable(),
    prefix: z.string().optional().nullable(),
    suffix: z.string().optional().nullable(),
    permission: z.string().optional().nullable(),
    public: z.boolean().optional().nullable(),
    updatedAt: z.string().optional().nullable(),
    updatedBy: z.string().optional().nullable()
})


export default settingSchema

export {settingSchema}
