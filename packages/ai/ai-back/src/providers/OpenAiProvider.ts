import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import type {
    IAIProvider,
    IPromptContentPart,
    IPromptMessage,
    IPromptParams,
    IPromptResponse
} from "../interfaces/IAIProvider";
import type {AILogService} from "../services/AILogService";
import type {IAILogBase} from "@drax/ai-share";

class OpenAiProvider implements IAIProvider{
    protected _apiKey: string
    protected _model: any
    protected _visionModel?: string
    protected _client: any
    protected _aiLogService?: AILogService

    constructor(apiKey: string, model: string, visionModel?: string, aiLogService?: AILogService) {

        if (!apiKey) {
            throw new Error("OpenAI apiKey required")
        }
        if (!model) {
            throw new Error("OpenAI model required")
        }

        this._apiKey = apiKey
        this._model = model
        this._visionModel = visionModel
        this._aiLogService = aiLogService
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

    protected get visionModel(){
        return this._visionModel
    }

    protected buildUserContent(input: IPromptParams): string | Array<{type: 'text', text: string} | {type: 'image_url', image_url: {url: string, detail?: 'auto' | 'low' | 'high'}}> {
        if(input.userContent && input.userContent.length > 0){
            return this.mapContentParts(input.userContent)
        }

        if(input.userImages && input.userImages.length > 0){
            const content: Array<{type: 'text', text: string} | {type: 'image_url', image_url: {url: string, detail?: 'auto' | 'low' | 'high'}}> = []

            if(input.userInput){
                content.push({type: 'text', text: input.userInput})
            }

            content.push(...input.userImages.map(image => ({
                type: 'image_url' as const,
                image_url: {
                    url: image.url,
                    ...(image.detail ? {detail: image.detail} : {}),
                }
            })))

            return content
        }

        return input.userInput ?? ""
    }

    protected mapContentParts(content: IPromptContentPart[]){
        return content.map(part => {
            if(part.type === 'text'){
                return {
                    type: 'text' as const,
                    text: part.text
                }
            }

            return {
                type: 'image_url' as const,
                image_url: {
                    url: part.imageUrl,
                    ...(part.detail ? {detail: part.detail} : {}),
                }
            }
        })
    }

    protected mapHistory(history: IPromptMessage[] = []){
        return history.map(message => ({
            role: message.role,
            content: typeof message.content === 'string'
                ? message.content
                : this.mapContentParts(message.content)
        }))
    }

    protected hasImageInput(input: IPromptParams){
        if(input.userImages && input.userImages.length > 0){
            return true
        }

        if(input.userContent?.some(part => part.type === 'image')){
            return true
        }

        return input.history?.some(message =>
            Array.isArray(message.content) && message.content.some(part => part.type === 'image')
        ) ?? false
    }

    protected serializePromptInput(input: IPromptParams, systemPrompt: string){
        return JSON.stringify({
            systemPrompt,
            history: input.history,
            userInput: input.userInput,
            userContent: input.userContent,
            memory: input.memory,
            knowledgeBase: input.knowledgeBase,
        })
    }

    protected serializePromptOutput(output: unknown){
        if (typeof output === "string") {
            return output
        }

        if (output === null || output === undefined) {
            return undefined
        }

        return JSON.stringify(output)
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
            provider: "openai",
            model: params.model,
            operationTitle: input.operationTitle,
            operationGroup: input.operationGroup,
            ip: input.ip,
            userAgent: input.userAgent,
            input: this.serializePromptInput(input, params.systemPrompt),
            inputImages: input.userImages?.map(image => ({
                url: image.url,
            })) ?? input.userContent
                ?.filter(part => part.type === "image")
                .map(part => ({
                    url: part.imageUrl,
                })),
            inputFiles: input.inputFiles,
            inputTokens: params.inputTokens,
            outputTokens: params.outputTokens,
            tokens: params.tokens,
            startedAt: params.startedAt,
            endedAt: params.endedAt,
            responseTime: params.endedAt ? `${params.endedAt.getTime() - params.startedAt.getTime()}ms` : undefined,
            output: this.serializePromptOutput(params.output),
            success: params.success,
            errorMessage: params.errorMessage,
            tenant: input.tenant,
            user: input.user,
        }
    }

    protected async registerPromptLog(input: IPromptParams, params: {
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
    }){
        if(!this._aiLogService){
            return
        }

        try{
            await this._aiLogService.create(this.buildLogPayload(input, params))
        }catch(e: any){
            console.error("Error registerPromptLog", {
                name: e?.name,
                message: e?.message,
                stack: e?.stack,
            })
        }
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

        let systemPrompt = input.systemPrompt

        if(input.memory && input.memory.length > 0){
            systemPrompt += `\n\n ${input.memoryHeader ?? '[MEMORIA]'}\n ${input.memory.map(m => `${m.key}: ${m.value}`).join('\n')}`
        }

        if(input.knowledgeBase && input.knowledgeBase.length > 0){
            systemPrompt += `\n\n${input.knowledgeBaseHeader ?? '[BASE DE CONOCIMIENTO]'}\n ${input.knowledgeBase.join('\n')}`
        }


        const userInput = this.buildUserContent(input)
        const model = input.model ?? (this.hasImageInput(input) ? this.visionModel ?? this.model : this.model)
        const startedAt = new Date()
        const startTime = performance.now()

        try {
            const chatCompletion = await this.client.chat.completions.create({
                messages: [
                    {role: 'system', content: systemPrompt},
                    ...this.mapHistory(input.history),
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
            const endedAt = new Date()

            await this.registerPromptLog(input, {
                model,
                systemPrompt,
                startedAt,
                endedAt,
                inputTokens,
                outputTokens,
                tokens,
                output,
                success: true,
            })

            return {
                output,
                tokens,
                inputTokens,
                outputTokens,
                time
            }
        } catch (e: any) {
            const endedAt = new Date()

            await this.registerPromptLog(input, {
                model,
                systemPrompt,
                startedAt,
                endedAt,
                success: false,
                errorMessage: e?.message,
            })

            throw e
        }
    }

}


export default OpenAiProvider
export {OpenAiProvider}
