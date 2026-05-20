import {DraxConfig} from "@drax/common-back";
import OpenAiConfig from "../../config/OpenAiConfig.js";
import type {IAIProvider} from "../../interfaces/IAIProvider.js"
import OpenAiProvider from "../../providers/ai/OpenAiProvider.js";
import AILogServiceFactory from "../services/AILogServiceFactory.js";

class OpenAiProviderFactory {
    private static singleton: IAIProvider;

    public static instance(): IAIProvider {
        if (!OpenAiProviderFactory.singleton) {
            OpenAiProviderFactory.singleton = new OpenAiProvider(
                DraxConfig.getOrLoad(OpenAiConfig.OpenAiApiKey),
                DraxConfig.getOrLoad(OpenAiConfig.OpenAiModel),
                DraxConfig.getOrLoad(OpenAiConfig.OpenAiVisionModel),
                AILogServiceFactory.instance
            );
        }
        return OpenAiProviderFactory.singleton;
    }
}

export default OpenAiProviderFactory
export {
    OpenAiProviderFactory
}
