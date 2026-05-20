import {z} from "zod";

const TTSVoiceSettingsSchema = z.object({
    stability: z.number().min(0).max(1).optional(),
    similarityBoost: z.number().min(0).max(1).optional(),
    style: z.number().min(0).max(1).optional(),
    useSpeakerBoost: z.boolean().optional(),
    speed: z.number().positive().optional(),
})

const TTSRequestSchema = z.object({
    text: z.string().min(1),
    provider: z.string().default("ElevenLabs"),
    voiceId: z.string().optional(),
    model: z.string().optional(),
    outputFormat: z.string().optional(),
    voiceSettings: TTSVoiceSettingsSchema.optional(),
    previousText: z.string().optional(),
    nextText: z.string().optional(),
    languageCode: z.string().optional(),
    seed: z.number().int().optional(),
    responseFormat: z.enum(["audio", "base64"]).default("audio"),
    operationTitle: z.string().optional(),
    operationGroup: z.string().optional(),
})

type TTSRequest = z.infer<typeof TTSRequestSchema>
type TTSVoiceSettings = z.infer<typeof TTSVoiceSettingsSchema>

export {
    TTSRequestSchema,
    TTSVoiceSettingsSchema,
}

export type {
    TTSRequest,
    TTSVoiceSettings,
}
