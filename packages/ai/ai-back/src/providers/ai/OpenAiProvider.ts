import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import type {
    IPromptContentPart,
    IPromptMessage,
    IPromptParams,
    IPromptResponse,
    IPromptTool
} from "../../interfaces/IAIProvider.js";
import type {AILogService} from "../../services/AILogService.js";
import PromptAudioService from "../../services/PromptAudioService.js";
import AbstractAiProvider from "./AbstractAiProvider.js";

class OpenAiProvider extends AbstractAiProvider{
    protected _apiKey: string
    protected _model: any
    protected _visionModel?: string
    protected _client: any

    constructor(apiKey: string, model: string, visionModel?: string, aiLogService?: AILogService, providerName: string = "openai") {

        if (!apiKey) {
            throw new Error("OpenAI apiKey required")
        }
        if (!model) {
            throw new Error("OpenAI model required")
        }

        super(providerName, aiLogService)

        this._apiKey = apiKey
        this._model = model
        this._visionModel = visionModel
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

    async generateEmbedding({text, model="text-embedding-ada-002"}: {text:string,model:string }): Promise<number[]> {
        const response = await this.client.embeddings.create({
            model: model,
            input: text,
        });
        return response.data[0].embedding;
    }

    protected mapTools(tools: IPromptTool[] = []){
        return tools.map(tool => ({
            type: "function" as const,
            function: {
                name: tool.name,
                description: tool.description,
                parameters: tool.parameters ?? {
                    type: "object",
                    properties: {},
                    additionalProperties: false,
                },
            },
        }))
    }

    protected parseToolArguments(args: string | undefined){
        if(!args){
            return {}
        }

        try{
            return JSON.parse(args)
        }catch(e){
            throw new Error(`Invalid tool arguments: ${args}`)
        }
    }

    protected serializeToolOutput(output: unknown){
        if(typeof output === "string"){
            return output
        }

        if(output === undefined){
            return ""
        }

        return JSON.stringify(output)
    }

    protected async buildToolMessages(toolCalls: any[] = [], tools: IPromptTool[] = []){
        const toolMessages: any[] = []

        for(const toolCall of toolCalls){
            const toolName = toolCall.function?.name
            const tool = tools.find(t => t.name === toolName)

            if(!tool){
                throw new Error(`Tool not found: ${toolName}`)
            }

            const args = this.parseToolArguments(toolCall.function?.arguments)
            const output = await tool.execute(args)

            toolMessages.push({
                role: "tool",
                tool_call_id: toolCall.id,
                content: this.serializeToolOutput(output),
            })
        }

        return toolMessages
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
        let tokens = 0
        let inputTokens = 0
        let outputTokens = 0

        try {
            const messages: any[] = [
                {role: 'system', content: systemPrompt},
                ...this.mapHistory(input.history),
                {role: 'user', content: userInput},
            ]
            const tools = input.tools ?? []
            const maxIterations = input.toolMaxIterations ?? 5
            let output: any

            for(let iteration = 0; iteration < maxIterations; iteration++){
                const chatCompletion = await this.client.chat.completions.create({
                    messages,

                    ...(input.zodSchema ? {response_format: zodResponseFormat(input.zodSchema, "event")} : {}),
                    ...(input.jsonSchema ? {response_format: input.jsonSchema} : {}),
                    ...(tools.length > 0 ? {tools: this.mapTools(tools)} : {}),
                    model: model,
                });

                tokens += chatCompletion.usage?.total_tokens ?? 0
                inputTokens += chatCompletion.usage?.prompt_tokens ?? 0
                outputTokens += chatCompletion.usage?.completion_tokens ?? 0

                const message = chatCompletion.choices[0].message
                const toolCalls = message.tool_calls ?? []

                if(toolCalls.length === 0){
                    output = message.content
                    break
                }

                messages.push(message)
                messages.push(...await this.buildToolMessages(toolCalls, tools))
            }

            if(output === undefined){
                throw new Error(`Tool max iterations reached: ${maxIterations}`)
            }

            const endTime = performance.now()
            const time = endTime - startTime
            const endedAt = new Date()
            const audio = await PromptAudioService.build(input, output)

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
                time,
                ...(audio ? {audio} : {}),
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
