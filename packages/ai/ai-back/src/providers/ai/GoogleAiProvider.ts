import {GoogleGenAI} from "@google/genai";
import type {
    Content,
    FunctionCall,
    FunctionDeclaration,
    GenerateContentConfig,
    Part
} from "@google/genai";
import {toJSONSchema} from "zod";
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

class GoogleAiProvider extends AbstractAiProvider{
    protected _apiKey: string
    protected _model: any
    protected _visionModel?: string
    protected _client: GoogleGenAI | undefined

    constructor(apiKey: string, model: string, visionModel?: string, aiLogService?: AILogService) {

        if (!apiKey) {
            throw new Error("Google AI apiKey required")
        }
        if (!model) {
            throw new Error("Google AI model required")
        }

        super("googleai", aiLogService)

        this._apiKey = apiKey
        this._model = model
        this._visionModel = visionModel
    }

    get model(){
        if(!this._model){
            throw new Error("Google AI model not found")
        }
        return this._model;
    }

    get client(){
        if(!this._client){
            this._client = new GoogleGenAI({
                apiKey: this._apiKey,
            });
        }

        return this._client
    }

    protected get visionModel(){
        return this._visionModel
    }

    protected buildUserContent(input: IPromptParams): Part[] {
        if(input.userContent && input.userContent.length > 0){
            return this.mapContentParts(input.userContent)
        }

        if(input.userImages && input.userImages.length > 0){
            const content: Part[] = []

            if(input.userInput){
                content.push({text: input.userInput})
            }

            content.push(...input.userImages.map(image => this.mapImageUrl(image.url)))

            return content
        }

        return input.userInput ? [{text: input.userInput}] : [{text: ""}]
    }

    protected mapContentParts(content: IPromptContentPart[]): Part[]{
        return content.map(part => {
            if(part.type === 'text'){
                return {
                    text: part.text
                }
            }

            return this.mapImageUrl(part.imageUrl)
        })
    }

    protected mapImageUrl(url: string): Part {
        const dataUrlMatch = url.match(/^data:([^;,]+);base64,(.+)$/)

        if(dataUrlMatch){
            return {
                inlineData: {
                    mimeType: dataUrlMatch[1],
                    data: dataUrlMatch[2],
                }
            }
        }

        return {
            fileData: {
                fileUri: url,
                mimeType: this.inferImageMimeType(url),
            }
        }
    }

    protected inferImageMimeType(url: string){
        const normalizedUrl = url.split("?")[0].toLowerCase()

        if(normalizedUrl.endsWith(".png")){
            return "image/png"
        }
        if(normalizedUrl.endsWith(".webp")){
            return "image/webp"
        }
        if(normalizedUrl.endsWith(".gif")){
            return "image/gif"
        }
        if(normalizedUrl.endsWith(".bmp")){
            return "image/bmp"
        }
        if(normalizedUrl.endsWith(".heic")){
            return "image/heic"
        }
        if(normalizedUrl.endsWith(".heif")){
            return "image/heif"
        }

        return "image/jpeg"
    }

    protected mapHistory(history: IPromptMessage[] = []): Content[]{
        return history.map(message => {
            const parts = typeof message.content === 'string'
                ? [{text: message.content}]
                : this.mapContentParts(message.content)

            if(message.role === "assistant"){
                return {
                    role: "model",
                    parts,
                }
            }

            if(message.role === "system"){
                return {
                    role: "user",
                    parts: [
                        {text: "[SYSTEM]"},
                        ...parts,
                    ],
                }
            }

            return {
                role: "user",
                parts,
            }
        })
    }

    async generateEmbedding({text, model="text-embedding-004"}: {text:string,model?:string }): Promise<number[]> {
        const response = await this.client.models.embedContent({
            model,
            contents: text,
        });
        return response.embeddings?.[0]?.values ?? [];
    }

    protected mapTools(tools: IPromptTool[] = []): Array<{functionDeclarations: FunctionDeclaration[]}> {
        if(tools.length === 0){
            return []
        }

        return [{
            functionDeclarations: tools.map(tool => ({
                name: tool.name,
                description: tool.description,
                parametersJsonSchema: tool.parameters ?? {
                    type: "object",
                    properties: {},
                    additionalProperties: false,
                },
            }))
        }]
    }

    protected buildResponseConfig(input: IPromptParams, systemPrompt: string): GenerateContentConfig {
        const config: GenerateContentConfig = {
            systemInstruction: systemPrompt,
        }

        const responseJsonSchema = this.normalizeResponseJsonSchema(input)

        if(responseJsonSchema){
            config.responseMimeType = "application/json"
            config.responseJsonSchema = responseJsonSchema
        }

        if(input.tools && input.tools.length > 0){
            config.tools = this.mapTools(input.tools)
        }

        return config
    }

    protected normalizeResponseJsonSchema(input: IPromptParams){
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

    protected async buildToolResponseParts(functionCalls: FunctionCall[] = [], tools: IPromptTool[] = []){
        const parts: Part[] = []

        for(const functionCall of functionCalls){
            const toolName = functionCall.name
            const tool = tools.find(t => t.name === toolName)

            if(!tool){
                throw new Error(`Tool not found: ${toolName}`)
            }

            const output = await tool.execute(functionCall.args ?? {})

            parts.push({
                functionResponse: {
                    id: functionCall.id,
                    name: toolName,
                    response: {
                        output,
                    },
                }
            })
        }

        return parts
    }

    protected buildModelFunctionCallContent(functionCalls: FunctionCall[] = []): Content {
        return {
            role: "model",
            parts: functionCalls.map(functionCall => ({
                functionCall,
            }))
        }
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
            const contents: Content[] = [
                ...this.mapHistory(input.history),
                {role: 'user', parts: userInput},
            ]
            const tools = input.tools ?? []
            const maxIterations = input.toolMaxIterations ?? 5
            let output: any

            for(let iteration = 0; iteration < maxIterations; iteration++){
                const response = await this.client.models.generateContent({
                    model,
                    contents,
                    config: this.buildResponseConfig(input, systemPrompt),
                });

                tokens += response.usageMetadata?.totalTokenCount ?? 0
                inputTokens += response.usageMetadata?.promptTokenCount ?? 0
                outputTokens += response.usageMetadata?.candidatesTokenCount ?? 0

                const functionCalls = response.functionCalls ?? []

                if(functionCalls.length === 0){
                    output = response.text
                    break
                }

                contents.push(response.candidates?.[0]?.content ?? this.buildModelFunctionCallContent(functionCalls))
                contents.push({
                    role: "user",
                    parts: await this.buildToolResponseParts(functionCalls, tools),
                })
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


export default GoogleAiProvider
export {GoogleAiProvider}
