import {AbstractBaseRestProvider} from "@drax/crud-front";

interface ITTSVoiceSettings {
  stability?: number;
  similarityBoost?: number;
  style?: number;
  useSpeakerBoost?: boolean;
  speed?: number;
}

interface ITTSTextToSpeechPayload {
  text: string;
  provider?: string;
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
}

interface ITTSTextToSpeechMeta {
  provider: string;
  model: string;
  voiceId: string;
  outputFormat?: string;
  size: number;
  time: number;
}

interface ITTSTextToSpeechResponse {
  audio: string;
  contentType: string;
  meta: ITTSTextToSpeechMeta;
}

interface ITTSProviderInfo {
  name: string;
  label: string;
}

interface ITTSProvidersResponse {
  providers: ITTSProviderInfo[];
}

class TTSProvider extends AbstractBaseRestProvider {

  static singleton: TTSProvider

  constructor() {
    super('/api/tts')
  }

  static get instance() {
    if (!TTSProvider.singleton) {
      TTSProvider.singleton = new TTSProvider()
    }
    return TTSProvider.singleton
  }

  async availableProviders(): Promise<ITTSProvidersResponse> {
    return await this.httpClient.get(`${this.basePath}/providers`, { timeout: 360000 }) as ITTSProvidersResponse
  }

  async textToSpeech(payload: ITTSTextToSpeechPayload): Promise<ITTSTextToSpeechResponse> {
    return await this.httpClient.post(this.basePath, {
      ...payload,
      responseFormat: 'base64',
    }, { timeout: 360000 }) as ITTSTextToSpeechResponse
  }

  async textToSpeechBlob(payload: ITTSTextToSpeechPayload): Promise<Blob> {
    const response = await this.textToSpeech(payload)
    return this.base64ToBlob(response.audio, response.contentType)
  }

  async textToSpeechObjectUrl(payload: ITTSTextToSpeechPayload): Promise<string> {
    const blob = await this.textToSpeechBlob(payload)
    return URL.createObjectURL(blob)
  }

  protected base64ToBlob(base64: string, contentType: string): Blob {
    const byteCharacters = atob(base64)
    const byteArrays: ArrayBuffer[] = []

    for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
      const slice = byteCharacters.slice(offset, offset + 1024)
      const byteNumbers = new Array(slice.length)

      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i)
      }

      byteArrays.push(new Uint8Array(byteNumbers).buffer)
    }

    return new Blob(byteArrays, {type: contentType})
  }

}

export default TTSProvider
export type {
  ITTSVoiceSettings,
  ITTSTextToSpeechPayload,
  ITTSTextToSpeechMeta,
  ITTSTextToSpeechResponse,
  ITTSProviderInfo,
  ITTSProvidersResponse,
}
