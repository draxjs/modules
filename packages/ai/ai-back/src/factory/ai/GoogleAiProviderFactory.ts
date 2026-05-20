import {DraxConfig} from "@drax/common-back";
import GoogleAiConfig from "../../config/GoogleAiConfig.js";
import type {IAIProvider} from "../../interfaces/IAIProvider.js"
import GoogleAiProvider from "../../providers/ai/GoogleAiProvider.js";
import AILogServiceFactory from "../services/AILogServiceFactory.js";

class GoogleAiProviderFactory {
    private static singleton: IAIProvider;

    public static instance(): IAIProvider {
        if (!GoogleAiProviderFactory.singleton) {
            GoogleAiProviderFactory.singleton = new GoogleAiProvider(
                DraxConfig.getOrLoad(GoogleAiConfig.GoogleAiApiKey),
                DraxConfig.getOrLoad(GoogleAiConfig.GoogleAiModel),
                DraxConfig.getOrLoad(GoogleAiConfig.GoogleAiVisionModel),
                AILogServiceFactory.instance
            );
        }
        return GoogleAiProviderFactory.singleton;
    }
}

export default GoogleAiProviderFactory
export {
    GoogleAiProviderFactory
}
