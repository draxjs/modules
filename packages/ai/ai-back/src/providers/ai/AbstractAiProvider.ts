import type {IAILogBase} from "@drax/ai-share";
import type {
    IAIProvider,
    IPromptParams,
    IPromptResponse,
} from "../../interfaces/IAIProvider.js";
import type {AILogService} from "../../services/AILogService.js";

type PromptLogParams = {
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
}

abstract class AbstractAiProvider implements IAIProvider {
    protected readonly providerName: string
    protected _aiLogService?: AILogService

    protected constructor(providerName: string, aiLogService?: AILogService) {
        this.providerName = providerName
        this._aiLogService = aiLogService
    }

    abstract prompt(input: IPromptParams): Promise<IPromptResponse>

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

    protected buildLogPayload(input: IPromptParams, params: PromptLogParams): IAILogBase {
        const responseTimeMS = params.endedAt
            ? params.endedAt.getTime() - params.startedAt.getTime()
            : undefined

        return {
            provider: this.providerName,
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
            responseTime: responseTimeMS !== undefined ? `${responseTimeMS}ms` : undefined,
            responseTimeMS,
            output: this.serializePromptOutput(params.output),
            success: params.success,
            errorMessage: params.errorMessage,
            tenant: input.tenant,
            user: input.user,
        }
    }

    protected async registerPromptLog(input: IPromptParams, params: PromptLogParams){
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
}

export default AbstractAiProvider
export {AbstractAiProvider}
