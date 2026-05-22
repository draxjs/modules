type IAIRole = 'user' | 'assistant' | 'system'

type IAIImageDetail = 'auto' | 'low' | 'high'

interface IAIImageInput {
    url: string
    detail?: IAIImageDetail
}

interface IAIInputFile {
    filename?: string
    filepath?: string
    size?: number | null
    mimetype?: string
    url?: string
}

interface IAIPromptContentPartText {
    type: 'text'
    text: string
}

interface IAIPromptContentPartImage {
    type: 'image'
    imageUrl: string
    detail?: IAIImageDetail
}

type IAIPromptContentPart = IAIPromptContentPartText | IAIPromptContentPartImage

interface IAIPromptMessage {
    role: IAIRole
    content: string | IAIPromptContentPart[]
}

interface IAIPromptMemory {
    key: string
    value: string
}

interface IAIPromptAudioVoiceSettings {
    stability?: number
    similarityBoost?: number
    style?: number
    useSpeakerBoost?: boolean
    speed?: number
}

interface IAIPromptAudioParams {
    enabled?: boolean
    provider?: string
    voiceId?: string
    model?: string
    outputFormat?: string
    voiceSettings?: IAIPromptAudioVoiceSettings
    previousText?: string
    nextText?: string
    languageCode?: string
    seed?: number
    operationTitle?: string
    operationGroup?: string
}

interface IAIGenericPromptPayload {
    systemPrompt: string
    userInput?: string
    userImages?: IAIImageInput[]
    inputFiles?: IAIInputFile[]
    userContent?: IAIPromptContentPart[]
    history?: IAIPromptMessage[]
    memory?: IAIPromptMemory[]
    memoryHeader?: string
    knowledgeBase?: string[]
    knowledgeBaseHeader?: string
    jsonSchema?: object | any[]
    model?: string
    operationTitle?: string
    operationGroup?: string
    audioResponse?: boolean | IAIPromptAudioParams
}

interface IAIPromptAudioResponseMeta {
    provider: string
    model: string
    voiceId: string
    outputFormat?: string
    size: number
    time: number
}

interface IAIPromptAudioResponse {
    audio: string
    contentType: string
    encoding: 'base64'
    meta: IAIPromptAudioResponseMeta
}

interface IAIPromptResponse {
    output: any
    tokens: number
    inputTokens: number
    outputTokens: number
    time: number
    audio?: IAIPromptAudioResponse
}

interface IAICrudFieldOption {
    title?: string | null
    value?: any
}

interface IAICrudField {
    name: string
    type: string
    label: string
    hint?: string | null
    placeholder?: string | null
    readonly?: boolean | null
    default?: any
    enum?: string[] | null
    items?: IAICrudFieldOption[] | null
    ref?: string | null
    refDisplay?: string | null
    objectFields?: IAICrudField[] | null
}

interface IAICrudPromptPayload {
    prompt: string
    operation?: 'create' | 'edit'
    entity: {
        name: string
        identifier?: string | null
    }
    currentValues?: Record<string, any>
    fields: IAICrudField[]
}

interface IAICrudPromptMeta {
    tokens: number
    inputTokens: number
    outputTokens: number
    time: number
}

interface IAICrudPromptResponse {
    message?: string | null
    suggestions: Record<string, any>
    warnings: string[]
    meta: IAICrudPromptMeta
}

export type {
    IAIRole,
    IAIImageDetail,
    IAIImageInput,
    IAIInputFile,
    IAIPromptContentPartText,
    IAIPromptContentPartImage,
    IAIPromptContentPart,
    IAIPromptMessage,
    IAIPromptMemory,
    IAIPromptAudioVoiceSettings,
    IAIPromptAudioParams,
    IAIPromptAudioResponse,
    IAIPromptAudioResponseMeta,
    IAIGenericPromptPayload,
    IAIPromptResponse,
    IAICrudFieldOption,
    IAICrudField,
    IAICrudPromptPayload,
    IAICrudPromptMeta,
    IAICrudPromptResponse,
}
