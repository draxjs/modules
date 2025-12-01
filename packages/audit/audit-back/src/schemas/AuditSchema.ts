import {z} from 'zod';


const AuditBaseSchema = z.object({
    entity: z.string().min(1, 'validation.required'),
    resourceId: z.string().optional().nullable(),
    user: z.object({
        id: z.string().min(1, 'validation.required'),
        username: z.string().min(1, 'validation.required'),
        rolName: z.string().optional().nullable()
    }),
    action: z.string().min(1, 'validation.required'),
    ip: z.string().optional().nullable(),
    userAgent: z.string().optional().nullable(),
    changes: z.array(
        z.object({
            field: z.string().min(1, 'validation.required'),
            old: z.any().optional().nullable(),
            new: z.any().optional().nullable()
        })
    ).optional(),
    sessionId: z.string().optional().nullable(),
    requestId: z.string().optional().nullable(),
    detail: z.string().optional().nullable(),
    tenant: z.object({
        id: z.string().optional().nullable(),
        name: z.string().optional().nullable()
    }).optional().nullable(),
    apiKey: z.object({
        id: z.string().optional().nullable(),
        name: z.string().optional().nullable()
    }).optional().nullable()
});

const AuditSchema = AuditBaseSchema
    .extend({
        _id: z.string(),
        createdAt: z.date(),

    })

export default AuditSchema;
export {AuditSchema, AuditBaseSchema}
