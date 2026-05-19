import {DraxConfig} from "@drax/common-back";
import DeepSeekConfig from "../config/DeepSeekConfig.js";
import type {IAIProvider} from "../interfaces/IAIProvider"
import DeepSeekProvider from "../providers/DeepSeekProvider.js";
import AILogServiceFactory from "./services/AILogServiceFactory.js";

class DeepSeekProviderFactory {
    private static singleton: IAIProvider;

    public static instance(): IAIProvider {
        if (!DeepSeekProviderFactory.singleton) {
            DeepSeekProviderFactory.singleton = new DeepSeekProvider(
                DraxConfig.getOrLoad(DeepSeekConfig.DeepSeekApiKey),
                DraxConfig.getOrLoad(DeepSeekConfig.DeepSeekModel),
                DraxConfig.getOrLoad(DeepSeekConfig.DeepSeekBaseUrl, "string", "https://api.deepseek.com"),
                DraxConfig.getOrLoad(DeepSeekConfig.DeepSeekVisionModel),
                AILogServiceFactory.instance
            );
        }
        return DeepSeekProviderFactory.singleton;
    }
}

export default DeepSeekProviderFactory
export {
    DeepSeekProviderFactory
}
