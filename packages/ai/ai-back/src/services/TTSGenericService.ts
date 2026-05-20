import TTSProviderFactory from "../factory/tts/TTSProviderFactory.js";
import type {TTSProviderInfo} from "../factory/tts/TTSProviderFactory.js";
import type {ITTSParams, ITTSResponse} from "../interfaces/ITTSProvider.js";
import type {TTSRequest} from "../schemas/TTSRequestSchema.js";

type TTSRequestContext = {
    ip?: string;
    userAgent?: string;
    tenant?: string | null;
    user?: string | null;
}

class TTSGenericService {

    availableProviders(): TTSProviderInfo[] {
        return TTSProviderFactory.availableProviders()
    }

    async textToSpeech(input: TTSRequest, context: TTSRequestContext = {}): Promise<ITTSResponse> {
        const ttsProvider = TTSProviderFactory.instance(input.provider)
        const ttsInput: ITTSParams = {
            ...(input as ITTSParams),
            operationTitle: input.operationTitle ?? "generic-tts",
            operationGroup: input.operationGroup ?? "generic-tts",
            ip: context.ip,
            userAgent: context.userAgent,
            tenant: context.tenant ?? null,
            user: context.user ?? null,
        }

        return ttsProvider.textToSpeech(ttsInput)
    }
}

export default TTSGenericService;
export {
    TTSGenericService,
}
export type {
    TTSRequestContext,
}
