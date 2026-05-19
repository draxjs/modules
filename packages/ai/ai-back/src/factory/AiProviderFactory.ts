import type {IAIProvider} from "../interfaces/IAIProvider"
import OpenAiProviderFactory from "./OpenAiProviderFactory.js";
import GoogleAiProviderFactory from "./GoogleAiProviderFactory.js";
import OllamaAiProviderFactory from "./OllamaAiProviderFactory.js";
import DeepSeekProviderFactory from "./DeepSeekProviderFactory.js";

class AiProviderFactory {
    private static singletons: Record<string, IAIProvider> = {};

    public static instance(provider: string = 'OpenAi'): IAIProvider {
        if (!AiProviderFactory.singletons[provider]) {
            switch (provider) {
                case 'OpenAi':
                    AiProviderFactory.singletons[provider] =  OpenAiProviderFactory.instance()
                    break;
                case 'GoogleAi':
                    AiProviderFactory.singletons[provider] =  GoogleAiProviderFactory.instance()
                    break;
                case 'OllamaAi':
                    AiProviderFactory.singletons[provider] =  OllamaAiProviderFactory.instance()
                    break;
                case 'DeepSeek':
                    AiProviderFactory.singletons[provider] =  DeepSeekProviderFactory.instance()
                    break;
                default:
                    throw new Error(`Unsupported AI provider: ${provider}`);
            }
        }
        return AiProviderFactory.singletons[provider];
    }
}

export default AiProviderFactory
export {
    AiProviderFactory
}
