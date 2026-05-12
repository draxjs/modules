import {z} from 'zod';

const AgentSessionBaseSchema = z.object({
    sessionId: z.string().min(1, 'validation.required'),
    title: z.string().optional(),
    lastMessageAt: z.coerce.date().nullable().optional(),
    messages: z.array(
        z.object({
            role: z.enum(['user', 'assistant', 'system']),
            content: z.string().min(1, 'validation.required'),
            createdAt: z.coerce.date().nullable().optional()
        })
    ).optional(),
    messageCount: z.number().nullable().optional(),
    inputTokens: z.number().nullable().optional(),
    outputTokens: z.number().nullable().optional(),
    tokens: z.number().nullable().optional(),
    tenant: z.coerce.string().optional().nullable(),
    user: z.coerce.string().optional().nullable()
});

const AgentSessionSchema = AgentSessionBaseSchema
    .extend({
        _id: z.coerce.string(),
        tenant: z.object({_id: z.coerce.string(), name: z.string().optional()}).nullable(),
        user: z.object({_id: z.coerce.string(), username: z.string().optional()}).nullable()
    })

export default AgentSessionSchema;
export {AgentSessionSchema, AgentSessionBaseSchema}
