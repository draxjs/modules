import type {ITTSParams, ITTSProvider, ITTSResponse} from "../../interfaces/ITTSProvider.js";

class ElevenLabsTTSProvider implements ITTSProvider {
    protected _apiKey: string
    protected _baseUrl: string
    protected _model: string
    protected _voiceId: string
    protected _outputFormat?: string

    constructor(apiKey: string, model: string, voiceId: string, baseUrl: string = "https://api.elevenlabs.io", outputFormat?: string) {
        if (!apiKey) {
            throw new Error("ElevenLabs apiKey required")
        }
        if (!model) {
            throw new Error("ElevenLabs model required")
        }
        if (!voiceId) {
            throw new Error("ElevenLabs voiceId required")
        }

        this._apiKey = apiKey
        this._model = model
        this._voiceId = voiceId
        this._baseUrl = baseUrl.replace(/\/+$/, "")
        this._outputFormat = outputFormat
    }

    get model() {
        if (!this._model) {
            throw new Error("ElevenLabs model not found")
        }
        return this._model
    }

    get voiceId() {
        if (!this._voiceId) {
            throw new Error("ElevenLabs voiceId not found")
        }
        return this._voiceId
    }

    protected mapContentType(outputFormat?: string) {
        if (!outputFormat) {
            return "audio/mpeg"
        }

        if (outputFormat.startsWith("mp3")) {
            return "audio/mpeg"
        }
        if (outputFormat.startsWith("opus")) {
            return "audio/ogg"
        }
        if (outputFormat.startsWith("pcm")) {
            return "audio/wav"
        }
        if (outputFormat.startsWith("ulaw") || outputFormat.startsWith("alaw")) {
            return "audio/basic"
        }

        return "application/octet-stream"
    }

    protected mapVoiceSettings(voiceSettings: ITTSParams["voiceSettings"]) {
        if (!voiceSettings) {
            return undefined
        }

        return {
            stability: voiceSettings.stability,
            similarity_boost: voiceSettings.similarityBoost,
            style: voiceSettings.style,
            use_speaker_boost: voiceSettings.useSpeakerBoost,
            speed: voiceSettings.speed,
        }
    }

    protected buildBody(input: ITTSParams, model: string) {
        return {
            text: input.text,
            model_id: model,
            ...(input.voiceSettings ? {voice_settings: this.mapVoiceSettings(input.voiceSettings)} : {}),
            ...(input.previousText ? {previous_text: input.previousText} : {}),
            ...(input.nextText ? {next_text: input.nextText} : {}),
            ...(input.languageCode ? {language_code: input.languageCode} : {}),
            ...(input.seed !== undefined ? {seed: input.seed} : {}),
        }
    }

    async textToSpeech(input: ITTSParams): Promise<ITTSResponse> {
        const startedAt = Date.now()
        const model = input.model ?? this.model
        const voiceId = input.voiceId ?? this.voiceId
        const outputFormat = input.outputFormat ?? this._outputFormat
        const url = new URL(`${this._baseUrl}/v1/text-to-speech/${encodeURIComponent(voiceId)}`)

        if (outputFormat) {
            url.searchParams.set("output_format", outputFormat)
        }

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Accept": this.mapContentType(outputFormat),
                "Content-Type": "application/json",
                "xi-api-key": this._apiKey,
            },
            body: JSON.stringify(this.buildBody(input, model)),
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`ElevenLabs TTS request failed (${response.status}): ${errorText}`)
        }

        const audio = Buffer.from(await response.arrayBuffer())
        const contentType = response.headers.get("content-type") ?? this.mapContentType(outputFormat)

        return {
            audio,
            contentType,
            size: audio.byteLength,
            time: Date.now() - startedAt,
            provider: "elevenlabs",
            model,
            voiceId,
            outputFormat,
        }
    }
}

export default ElevenLabsTTSProvider;
export {ElevenLabsTTSProvider}
