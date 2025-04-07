import {DraxConfig} from "@drax/common-back";
import OpenAiConfig from "../config/OpenAiConfig.js";
import type {IAIProvider} from "../interfaces/IAIProvider"
import OpenAiProvider from "../providers/OpenAiProvider.js";

class OpenAiProviderFactory {
    private static singleton: IAIProvider;

    public static instance(): IAIProvider {
        if (!OpenAiProviderFactory.singleton) {
            OpenAiProviderFactory.singleton = new OpenAiProvider(
                DraxConfig.getOrLoad(OpenAiConfig.OpenAiApiKey),
                DraxConfig.getOrLoad(OpenAiConfig.OpenAiModel)
            );
        }
        return OpenAiProviderFactory.singleton;
    }
}

export default OpenAiProviderFactory
export {
    OpenAiProviderFactory
}

