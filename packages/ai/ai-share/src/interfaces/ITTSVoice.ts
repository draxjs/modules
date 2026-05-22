type TTSVoiceProvider = 'ElevenLabs'

interface ITTSVoiceBase {
    name: string
    ttsProvider: TTSVoiceProvider
    voiceId: string
    model?: string
    languageCode?: string
    tenant?: any
    user?: any
    createdAt?: Date
    updatedAt?: Date
}

interface ITTSVoice extends ITTSVoiceBase {
    _id: string
}

export type {
    ITTSVoiceBase,
    ITTSVoice,
    TTSVoiceProvider,
}
