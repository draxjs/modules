import {z} from 'zod';


const AILogBaseSchema = z.object({
    provider: z.string().optional(),
    model: z.string().optional(),
    operationTitle: z.string().optional(),
    operationGroup: z.string().optional(),
    ip: z.string().optional(),
    userAgent: z.string().optional(),
    input: z.string().optional(),
    inputImages: z.array(
        z.object({
            filename: z.string().optional(),
            filepath: z.string().optional(),
            size: z.number().nullable().optional(),
            mimetype: z.string().optional(),
            url: z.string().optional()
        })
    ).optional(),
    inputFiles: z.array(
        z.object({
            filename: z.string().optional(),
            filepath: z.string().optional(),
            size: z.number().nullable().optional(),
            mimetype: z.string().optional(),
            url: z.string().optional()
        })
    ).optional(),
    inputTokens: z.number().nullable().optional(),
    outputTokens: z.number().nullable().optional(),
    tokens: z.number().nullable().optional(),
    startedAt: z.coerce.date().nullable().optional(),
    endedAt: z.coerce.date().nullable().optional(),
    responseTime: z.string().optional(),
    output: z.string().optional(),
    success: z.boolean().optional(),
    statusCode: z.number().nullable().optional(),
    errorMessage: z.string().optional(),
    tenant: z.coerce.string().optional().nullable(),
    user: z.coerce.string().optional().nullable()
});

const AILogSchema = AILogBaseSchema
    .extend({
        _id: z.coerce.string(),
        tenant: z.object({_id: z.coerce.string(), name: z.string()}).nullable().optional(),
        user: z.object({_id: z.coerce.string(), username: z.string()}).nullable().optional()
    })

export default AILogSchema;
export {AILogSchema, AILogBaseSchema}
