import {z} from 'zod';

const TTSVoiceProviderSchema = z.enum(['ElevenLabs']);

const TTSVoiceBaseSchema = z.object({
    name: z.string().min(1, 'validation.required'),
    ttsProvider: TTSVoiceProviderSchema,
    voiceId: z.string().min(1, 'validation.required'),
    model: z.string().optional().nullable(),
    languageCode: z.string().optional().nullable(),
    tenant: z.coerce.string().optional().nullable(),
    user: z.coerce.string().optional().nullable()
});

const TTSVoiceSchema = TTSVoiceBaseSchema
    .extend({
        _id: z.coerce.string(),
        tenant: z.object({_id: z.coerce.string(), name: z.string().optional()}).nullable().optional(),
        user: z.object({_id: z.coerce.string(), username: z.string().optional()}).nullable().optional()
    })

export default TTSVoiceSchema;
export {TTSVoiceSchema, TTSVoiceBaseSchema, TTSVoiceProviderSchema}
