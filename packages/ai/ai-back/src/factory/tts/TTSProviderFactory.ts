import type {ITTSProvider} from "../../interfaces/ITTSProvider.js";
import ElevenLabsTTSProviderFactory from "./ElevenLabsTTSProviderFactory.js";

type TTSProviderInfo = {
    name: string;
    label: string;
}

class TTSProviderFactory {
    private static singletons: Record<string, ITTSProvider> = {};
    private static providers: TTSProviderInfo[] = [
        {
            name: "ElevenLabs",
            label: "ElevenLabs",
        },
    ];

    public static availableProviders(): TTSProviderInfo[] {
        return TTSProviderFactory.providers
    }

    public static instance(provider: string = "ElevenLabs"): ITTSProvider {
        if (!TTSProviderFactory.singletons[provider]) {
            switch (provider) {
                case "ElevenLabs":
                    TTSProviderFactory.singletons[provider] = ElevenLabsTTSProviderFactory.instance()
                    break;
                default:
                    throw new Error(`Unsupported TTS provider: ${provider}`);
            }
        }
        return TTSProviderFactory.singletons[provider];
    }
}

export default TTSProviderFactory
export {
    TTSProviderFactory
}
export type {
    TTSProviderInfo,
}
