import {DraxConfig} from "@drax/common-back";
import ElevenLabsTTSConfig from "../../config/ElevenLabsTTSConfig.js";
import type {ITTSProvider} from "../../interfaces/ITTSProvider.js";
import ElevenLabsTTSProvider from "../../providers/tts/ElevenLabsTTSProvider.js";

class ElevenLabsTTSProviderFactory {
    private static singleton: ITTSProvider;

    public static instance(): ITTSProvider {
        if (!ElevenLabsTTSProviderFactory.singleton) {
            ElevenLabsTTSProviderFactory.singleton = new ElevenLabsTTSProvider(
                DraxConfig.getOrLoad(ElevenLabsTTSConfig.ElevenLabsApiKey),
                DraxConfig.getOrLoad(ElevenLabsTTSConfig.ElevenLabsModel, "string", "eleven_multilingual_v2"),
                DraxConfig.getOrLoad(ElevenLabsTTSConfig.ElevenLabsVoiceId),
                DraxConfig.getOrLoad(ElevenLabsTTSConfig.ElevenLabsBaseUrl, "string", "https://api.elevenlabs.io"),
                DraxConfig.getOrLoad(ElevenLabsTTSConfig.ElevenLabsOutputFormat, "string", "mp3_44100_128"),
            );
        }
        return ElevenLabsTTSProviderFactory.singleton;
    }
}

export default ElevenLabsTTSProviderFactory
export {
    ElevenLabsTTSProviderFactory
}
