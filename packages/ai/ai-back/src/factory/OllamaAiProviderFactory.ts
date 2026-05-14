import {DraxConfig} from "@drax/common-back";
import OllamaAiConfig from "../config/OllamaAiConfig.js";
import type {IAIProvider} from "../interfaces/IAIProvider"
import OllamaAiProvider from "../providers/OllamaAiProvider.js";
import AILogServiceFactory from "./services/AILogServiceFactory.js";

class OllamaAiProviderFactory {
    private static singleton: IAIProvider;

    public static instance(): IAIProvider {
        if (!OllamaAiProviderFactory.singleton) {
            OllamaAiProviderFactory.singleton = new OllamaAiProvider(
                DraxConfig.getOrLoad(OllamaAiConfig.OllamaAiBaseUrl, "string", "http://localhost:11434"),
                DraxConfig.getOrLoad(OllamaAiConfig.OllamaAiModel),
                DraxConfig.getOrLoad(OllamaAiConfig.OllamaAiVisionModel),
                DraxConfig.getOrLoad(OllamaAiConfig.OllamaAiEmbeddingModel),
                AILogServiceFactory.instance
            );
        }
        return OllamaAiProviderFactory.singleton;
    }
}

export default OllamaAiProviderFactory
export {
    OllamaAiProviderFactory
}
