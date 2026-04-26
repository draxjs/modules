import {AbstractBaseRestProvider} from "@drax/crud-front";
import type {
  IAICrudPromptPayload,
  IAICrudPromptResponse,
  IAIGenericPromptPayload,
  IAIPromptResponse,
} from "@drax/ai-share";

class AiProvider extends AbstractBaseRestProvider {

  static singleton: AiProvider

  constructor() {
    super('/api/ai')
  }

  static get instance() {
    if (!AiProvider.singleton) {
      AiProvider.singleton = new AiProvider()
    }
    return AiProvider.singleton
  }

  async promptGeneric(payload: IAIGenericPromptPayload): Promise<IAIPromptResponse> {
    return await this.httpClient.post(`${this.basePath}/prompt/generic`, payload, { timeout: 360000 }) as IAIPromptResponse
  }

  async promptCrud(payload: IAICrudPromptPayload): Promise<IAICrudPromptResponse> {
    return await this.httpClient.post(`${this.basePath}/prompt/crud`, payload, { timeout: 360000 }) as IAICrudPromptResponse
  }

}

export default AiProvider
