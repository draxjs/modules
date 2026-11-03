import {z} from 'zod';

const AgentSessionContentPartSchema = z.discriminatedUnion('type', [
    z.object({type: z.literal('text'), text: z.string()}),
    z.object({
        type: z.literal('image'),
        imageUrl: z.string(),
        detail: z.enum(['auto', 'low', 'high']).optional()
    })
]);

const AgentSessionInputFileSchema = z.object({
    filename: z.string().optional(),
    filepath: z.string().optional(),
    size: z.number().nullable().optional(),
    mimetype: z.string().optional(),
    url: z.string().optional()
});

const AgentSessionBaseSchema = z.object({
    sessionId: z.string().min(1, 'validation.required'),
    ownerAgentIdentifier: z.string().optional(),
    conversationType: z.enum(['specialist', 'router']).optional(),
    lastResolvedAgentIdentifier: z.string().optional(),
    title: z.string().optional(),
    lastMessageAt: z.coerce.date().nullable().optional(),
    messages: z.array(
        z.object({
            role: z.enum(['user', 'assistant', 'system']),
            content: z.string().min(1, 'validation.required'),
            createdAt: z.coerce.date().nullable().optional(),
            resolvedAgentIdentifier: z.string().optional(),
            correlationId: z.string().optional(),
            userContent: z.array(AgentSessionContentPartSchema).optional(),
            inputFiles: z.array(AgentSessionInputFileSchema).optional()
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
