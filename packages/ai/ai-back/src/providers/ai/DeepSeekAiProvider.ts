import OpenAI from "openai";
import type {AILogService} from "../../services/AILogService.js";
import OpenAiProvider from "./OpenAiProvider.js";

class DeepSeekAiProvider extends OpenAiProvider{
    protected _baseUrl: string

    constructor(apiKey: string, model: string, baseUrl: string = "https://api.deepseek.com", visionModel?: string, aiLogService?: AILogService) {
        if (!apiKey) {
            throw new Error("DeepSeek apiKey required")
        }
        if (!model) {
            throw new Error("DeepSeek model required")
        }

        super(apiKey, model, visionModel, aiLogService, "deepseek")

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

}

export default DeepSeekAiProvider
export {DeepSeekAiProvider}
