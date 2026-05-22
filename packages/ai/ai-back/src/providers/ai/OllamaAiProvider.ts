import {toJSONSchema} from "zod";
import type {
    IAIProvider,
    IPromptContentPart,
    IPromptMessage,
    IPromptParams,
    IPromptResponse,
    IPromptTool
} from "../../interfaces/IAIProvider.js";
import type {AILogService} from "../../services/AILogService.js";
import type {IAILogBase} from "@drax/ai-share";
import PromptAudioService from "../../services/PromptAudioService.js";

type OllamaMessage = {
    role: "system" | "user" | "assistant" | "tool",
    content: string,
    images?: string[],
    name?: string,
}

type OllamaToolCall = {
    function?: {
        name?: string,
        arguments?: string | object,
    }
}

class OllamaAiProvider implements IAIProvider{
    protected _baseUrl: string
    protected _model: string
    protected _visionModel?: string
    protected _embeddingModel?: string
    protected _aiLogService?: AILogService

    constructor(baseUrl: string, model: string, visionModel?: string, embeddingModel?: string, aiLogService?: AILogService) {

        if (!baseUrl) {
            throw new Error("Ollama AI baseUrl required")
        }
        if (!model) {
            throw new Error("Ollama AI model required")
        }

        this._baseUrl = baseUrl.replace(/\/+$/, "")
        this._model = model
        this._visionModel = visionModel
        this._embeddingModel = embeddingModel
        this._aiLogService = aiLogService
    }

    get model(){
        if(!this._model){
            throw new Error("Ollama AI model not found")
        }
        return this._model;
    }

    protected get visionModel(){
        return this._visionModel
    }

    protected get embeddingModel(){
        return this._embeddingModel ?? this.model
    }

    protected async post<T>(path: string, body: object): Promise<T> {
        const response = await fetch(`${this._baseUrl}${path}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        })

        if(!response.ok){
            const errorText = await response.text()
            throw new Error(`Ollama AI request failed (${response.status}): ${errorText}`)
        }

        return await response.json() as T
    }

    protected async buildUserMessage(input: IPromptParams): Promise<OllamaMessage> {
        if(input.userContent && input.userContent.length > 0){
            return await this.mapContentPartsToMessage(input.userContent)
        }

        if(input.userImages && input.userImages.length > 0){
            return {
                role: "user",
                content: input.userInput ?? "",
                images: await Promise.all(input.userImages.map(image => this.imageUrlToBase64(image.url))),
            }
        }

        return {
            role: "user",
            content: input.userInput ?? "",
        }
    }

    protected async mapContentPartsToMessage(content: IPromptContentPart[], role: "user" | "assistant" | "system" = "user"): Promise<OllamaMessage> {
        const text: string[] = []
        const images: string[] = []

        for(const part of content){
            if(part.type === "text"){
                text.push(part.text)
                continue
            }

            images.push(await this.imageUrlToBase64(part.imageUrl))
        }

        return {
            role,
            content: text.join("\n"),
            ...(images.length > 0 ? {images} : {}),
        }
    }

    protected async imageUrlToBase64(url: string): Promise<string> {
        const dataUrlMatch = url.match(/^data:[^;,]+;base64,(.+)$/)

        if(dataUrlMatch){
            return dataUrlMatch[1]
        }

        const response = await fetch(url)

        if(!response.ok){
            throw new Error(`Ollama AI image request failed (${response.status}): ${url}`)
        }

        const buffer = Buffer.from(await response.arrayBuffer())
        return buffer.toString("base64")
    }

    protected async mapHistory(history: IPromptMessage[] = []): Promise<OllamaMessage[]>{
        const messages: OllamaMessage[] = []

        for(const message of history){
            if(typeof message.content === "string"){
                messages.push({
                    role: message.role,
                    content: message.content,
                })
                continue
            }

            messages.push(await this.mapContentPartsToMessage(message.content, message.role))
        }

        return messages
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
            tools: input.tools?.map(tool => ({
                name: tool.name,
                description: tool.description,
                parameters: tool.parameters,
            })),
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
            provider: "ollamaai",
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

    async generateEmbedding({text, model}: {text:string, model?:string }): Promise<number[]> {
        const response = await this.post<any>("/api/embed", {
            model: model ?? this.embeddingModel,
            input: text,
        });

        return response.embeddings?.[0] ?? response.embedding ?? [];
    }

    protected mapTools(tools: IPromptTool[] = []){
        return tools.map(tool => ({
            type: "function",
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

    protected normalizeResponseFormat(input: IPromptParams){
        if(input.zodSchema){
            return toJSONSchema(input.zodSchema, {
                target: "draft-7",
            })
        }

        if(!input.jsonSchema){
            return undefined
        }

        const jsonSchema: any = input.jsonSchema

        if(jsonSchema.type === "json_schema" && jsonSchema.json_schema?.schema){
            return jsonSchema.json_schema.schema
        }

        return jsonSchema
    }

    protected parseToolArguments(args: string | object | undefined){
        if(!args){
            return {}
        }

        if(typeof args === "object"){
            return args
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

    protected async buildToolMessages(toolCalls: OllamaToolCall[] = [], tools: IPromptTool[] = []){
        const toolMessages: OllamaMessage[] = []

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
                name: toolName,
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

        const model = input.model ?? (this.hasImageInput(input) ? this.visionModel ?? this.model : this.model)
        const startedAt = new Date()
        const startTime = performance.now()
        let tokens = 0
        let inputTokens = 0
        let outputTokens = 0

        try {
            const messages: OllamaMessage[] = [
                {role: 'system', content: systemPrompt},
                ...await this.mapHistory(input.history),
                await this.buildUserMessage(input),
            ]
            const tools = input.tools ?? []
            const maxIterations = input.toolMaxIterations ?? 5
            const responseFormat = this.normalizeResponseFormat(input)
            let output: any

            for(let iteration = 0; iteration < maxIterations; iteration++){
                const response = await this.post<any>("/api/chat", {
                    model,
                    messages,
                    stream: false,
                    ...(responseFormat ? {format: responseFormat} : {}),
                    ...(tools.length > 0 ? {tools: this.mapTools(tools)} : {}),
                });

                inputTokens += response.prompt_eval_count ?? 0
                outputTokens += response.eval_count ?? 0
                tokens += (response.prompt_eval_count ?? 0) + (response.eval_count ?? 0)

                const message = response.message ?? {}
                const toolCalls = message.tool_calls ?? []

                if(toolCalls.length === 0){
                    output = message.content ?? response.response ?? ""
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


export default OllamaAiProvider
export {OllamaAiProvider}
