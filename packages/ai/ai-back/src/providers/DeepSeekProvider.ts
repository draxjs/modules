import OpenAI from "openai";
import type {IAILogBase} from "@drax/ai-share";
import type {IPromptParams} from "../interfaces/IAIProvider.js";
import type {AILogService} from "../services/AILogService.js";
import OpenAiProvider from "./OpenAiProvider.js";

class DeepSeekProvider extends OpenAiProvider{
    protected _baseUrl: string

    constructor(apiKey: string, model: string, baseUrl: string = "https://api.deepseek.com", visionModel?: string, aiLogService?: AILogService) {
        if (!apiKey) {
            throw new Error("DeepSeek apiKey required")
        }
        if (!model) {
            throw new Error("DeepSeek model required")
        }

        super(apiKey, model, visionModel, aiLogService)

        if (!baseUrl) {
            throw new Error("DeepSeek baseUrl required")
        }

        this._baseUrl = baseUrl
    }

    get client(){
        if(!this._client){
            this._client = new OpenAI({
                apiKey: this._apiKey,
                baseURL: this._baseUrl,
            });
        }

        return this._client
    }

    protected buildLogPayload(input: IPromptParams, params: {
        model: string,
        systemPrompt: string,
        startedAt: Date,
        endedAt?: Date,
        inputTokens?: number,
        outputTokens?: number,
        tokens?: number,
        output?: unknown,
        success: boolean,
        errorMessage?: string,
    }): IAILogBase {
        return {
            ...super.buildLogPayload(input, params),
            provider: "deepseek",
        }
    }
}

export default DeepSeekProvider
export {DeepSeekProvider}
