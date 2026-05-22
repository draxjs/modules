import TTSProviderFactory from "../factory/tts/TTSProviderFactory.js";
import type {IPromptAudioParams, IPromptAudioResponse, IPromptParams} from "../interfaces/IAIProvider.js";

class PromptAudioService {

    static audioParams(input: IPromptParams): IPromptAudioParams | null {
        if(!input.audioResponse){
            return null
        }

        if(input.audioResponse === true){
            return {}
        }

        if(input.audioResponse.enabled === false){
            return null
        }

        return input.audioResponse
    }

    static outputToText(output: unknown): string {
        if(typeof output === "string"){
            return output
        }

        if(output === null || output === undefined){
            return ""
        }

        return JSON.stringify(output)
    }

    static async build(input: IPromptParams, output: unknown): Promise<IPromptAudioResponse | undefined> {
        const audioParams = PromptAudioService.audioParams(input)

        if(!audioParams){
            return undefined
        }

        const text = PromptAudioService.outputToText(output).trim()

        if(!text){
            return undefined
        }

        const providerName = audioParams.provider ?? "ElevenLabs"
        const ttsProvider = TTSProviderFactory.instance(providerName)
        const response = await ttsProvider.textToSpeech({
            text,
            voiceId: audioParams.voiceId,
            model: audioParams.model,
            outputFormat: audioParams.outputFormat,
            voiceSettings: audioParams.voiceSettings,
            previousText: audioParams.previousText,
            nextText: audioParams.nextText,
            languageCode: audioParams.languageCode,
            seed: audioParams.seed,
            operationTitle: audioParams.operationTitle ?? input.operationTitle,
            operationGroup: audioParams.operationGroup ?? input.operationGroup,
            ip: input.ip,
            userAgent: input.userAgent,
            tenant: input.tenant,
            user: input.user,
        })

        return {
            audio: response.audio.toString("base64"),
            contentType: response.contentType,
            encoding: "base64",
            meta: {
                provider: response.provider,
                model: response.model,
                voiceId: response.voiceId,
                outputFormat: response.outputFormat,
                size: response.size,
                time: response.time,
            },
        }
    }

}

export default PromptAudioService
export {
    PromptAudioService,
}
