interface ITTSVoiceSettings {
    stability?: number;
    similarityBoost?: number;
    style?: number;
    useSpeakerBoost?: boolean;
    speed?: number;
}

interface ITTSParams {
    text: string;
    voiceId?: string;
    model?: string;
    outputFormat?: string;
    voiceSettings?: ITTSVoiceSettings;
    previousText?: string;
    nextText?: string;
    languageCode?: string;
    seed?: number;
    operationTitle?: string;
    operationGroup?: string;
    ip?: string;
    userAgent?: string;
    tenant?: string | null;
    user?: string | null;
}

interface ITTSResponse {
    audio: Buffer;
    contentType: string;
    size: number;
    time: number;
    provider: string;
    model: string;
    voiceId: string;
    outputFormat?: string;
}

interface ITTSProvider {
    textToSpeech(input: ITTSParams): Promise<ITTSResponse>
}

export type {
    ITTSProvider,
    ITTSParams,
    ITTSResponse,
    ITTSVoiceSettings,
}
