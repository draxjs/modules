import {DraxConfig} from "@drax/common-back";
import DeepSeekConfig from "../../config/DeepSeekConfig.js";
import type {IAIProvider} from "../../interfaces/IAIProvider.js"
import DeepSeekAiProvider from "../../providers/ai/DeepSeekAiProvider.js";
import AILogServiceFactory from "../services/AILogServiceFactory.js";

class DeepSeekAiProviderFactory {
    private static singleton: IAIProvider;

    public static instance(): IAIProvider {
        if (!DeepSeekAiProviderFactory.singleton) {
            DeepSeekAiProviderFactory.singleton = new DeepSeekAiProvider(
                DraxConfig.getOrLoad(DeepSeekConfig.DeepSeekApiKey),
                DraxConfig.getOrLoad(DeepSeekConfig.DeepSeekModel),
                DraxConfig.getOrLoad(DeepSeekConfig.DeepSeekBaseUrl, "string", "https://api.deepseek.com"),
                DraxConfig.getOrLoad(DeepSeekConfig.DeepSeekVisionModel),
                AILogServiceFactory.instance
            );
        }
        return DeepSeekAiProviderFactory.singleton;
    }
}

export default DeepSeekAiProviderFactory
export {
    DeepSeekAiProviderFactory
}
