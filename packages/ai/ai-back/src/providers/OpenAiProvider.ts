import OpenAI from "openai";
import type {ZodTypeAny} from "zod"
import { zodResponseFormat } from "openai/helpers/zod";
import type {IAIProvider, IPromptParams, IPromptResponse} from "../interfaces/IAIProvider";

class OpenAiProvider implements IAIProvider{
    protected _apiKey: string
    protected _model: any
    protected _client: any

    constructor(apiKey: string, model: string) {

        if (!apiKey) {
            throw new Error("OpenAI apiKey required")
        }
        if (!model) {
            throw new Error("OpenAI model required")
        }

        this._apiKey = apiKey
        this._model = model
    }

    get model(){
        if(!this._model){
            throw new Error("OpenAI model not found")
        }
        return this._model;
    }

    get client(){
        if(!this._client){
            this._client = new OpenAI({
                apiKey: this._apiKey,
            });
        }

        return this._client
    }

    async generateEmbedding({text, model="text-embedding-ada-002"}: {text:string,model:string }): Promise<number[]> {
        const response = await this.client.embeddings.create({
            model: model,
            input: text,
        });
        return response.data[0].embedding;
    }

    async prompt(input: IPromptParams): Promise<IPromptResponse> {

        if(!input.systemPrompt){
            throw new Error("systemPrompt required")
        }

        const model = input.model ?? this.model

        let systemPrompt = input.systemPrompt

        if(input.memory && input.memory.length > 0){
            systemPrompt += `\n\n ${input.memoryHeader ?? '[MEMORIA]'}\n ${input.memory.map(m => `${m.key}: ${m.value}`).join('\n')}`
        }

        if(input.knowledgeBase && input.knowledgeBase.length > 0){
            systemPrompt += `\n\n${input.knowledgeBaseHeader ?? '[BASE DE CONOCIMIENTO]'}\n ${input.knowledgeBase.join('\n')}`
        }


        let userInput = input.userInput

        const startTime = performance.now()

        const chatCompletion = await this.client.chat.completions.create({
            messages: [
                {role: 'system', content: systemPrompt},
                ...(input.history ? input.history : []),
                {role: 'user', content: userInput},
            ],

            ...(input.zodSchema ? {response_format: zodResponseFormat(input.zodSchema, "event")} : {}),
            ...(input.jsonSchema ? {response_format: input.jsonSchema} : {}),
            model: model,
        });


        const output = chatCompletion.choices[0].message.content
        const tokens = chatCompletion.usage.total_tokens
        const inputTokens = chatCompletion.usage.prompt_tokens
        const outputTokens = chatCompletion.usage.completion_tokens

        const endTime = performance.now()
        const time = endTime - startTime

        return {
            output,
            tokens,
            inputTokens,
            outputTokens,
            time
        }
    }

}


export default OpenAiProvider
export {OpenAiProvider}
