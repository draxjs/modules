import type {IAIProvider} from "../interfaces/IAIProvider"
import OpenAiProviderFactory from "./OpenAiProviderFactory.js";

class AiProviderFactory {
    private static singleton: IAIProvider;

    public static instance(provider: string): IAIProvider {
        if (!AiProviderFactory.singleton) {
            switch (provider) {
                case 'OpenAi':
                    AiProviderFactory.singleton =  OpenAiProviderFactory.instance()
                    break;
                default:
                    throw new Error(`Unsupported AI provider: ${provider}`);
            }
        }
        return AiProviderFactory.singleton;
    }
}

export default AiProviderFactory
export {
    AiProviderFactory
}

