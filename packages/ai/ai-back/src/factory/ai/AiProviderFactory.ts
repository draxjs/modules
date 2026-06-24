import type {IAIProvider} from "../../interfaces/IAIProvider.js"
import {DraxConfig} from "@drax/common-back";
import AiConfig from "../../config/AiConfig.js";
import OpenAiProviderFactory from "./OpenAiProviderFactory.js";
import GoogleAiProviderFactory from "./GoogleAiProviderFactory.js";
import OllamaAiProviderFactory from "./OllamaAiProviderFactory.js";
import DeepSeekAiProviderFactory from "./DeepSeekAiProviderFactory.js";

class AiProviderFactory {
    private static singletons: Record<string, IAIProvider> = {};

    public static instance(provider: string = DraxConfig.getOrLoad(AiConfig.AiProvider, "string", "OpenAi")): IAIProvider {
        if (!AiProviderFactory.singletons[provider]) {
            switch (provider) {
                case 'OpenAi':
                    AiProviderFactory.singletons[provider] =  OpenAiProviderFactory.instance()
                    break;
                case 'GoogleAi':
                case 'Google':
                    AiProviderFactory.singletons[provider] =  GoogleAiProviderFactory.instance()
                    break;
                case 'OllamaAi':
                case 'Ollama':
                    AiProviderFactory.singletons[provider] =  OllamaAiProviderFactory.instance()
                    break;
                case 'DeepSeekAi':
                case 'DeepSeek':
                    AiProviderFactory.singletons[provider] =  DeepSeekAiProviderFactory.instance()
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
