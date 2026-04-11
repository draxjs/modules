import type { IAIProvider, IPromptContentPart, IPromptMessage, IPromptParams, IPromptResponse } from "../interfaces/IAIProvider";
import type { AILogService } from "../services/AILogService";
import type { IAILogBase } from "@drax/ai-share";
declare class OpenAiProvider implements IAIProvider {
    protected _apiKey: string;
    protected _model: any;
    protected _visionModel?: string;
    protected _client: any;
    protected _aiLogService?: AILogService;
    constructor(apiKey: string, model: string, visionModel?: string, aiLogService?: AILogService);
    get model(): any;
    get client(): any;
    protected get visionModel(): string;
    protected buildUserContent(input: IPromptParams): string | Array<{
        type: 'text';
        text: string;
    } | {
        type: 'image_url';
        image_url: {
            url: string;
            detail?: 'auto' | 'low' | 'high';
        };
    }>;
    protected mapContentParts(content: IPromptContentPart[]): ({
        type: "text";
        text: string;
        image_url?: undefined;
    } | {
        type: "image_url";
        image_url: {
            detail?: import("../interfaces/IAIProvider").IPromptImageDetail;
            url: string;
        };
        text?: undefined;
    })[];
    protected mapHistory(history?: IPromptMessage[]): {
        role: "user" | "assistant" | "system";
        content: string | ({
            type: "text";
            text: string;
            image_url?: undefined;
        } | {
            type: "image_url";
            image_url: {
                detail?: import("../interfaces/IAIProvider").IPromptImageDetail;
                url: string;
            };
            text?: undefined;
        })[];
    }[];
    protected hasImageInput(input: IPromptParams): boolean;
    protected serializePromptInput(input: IPromptParams, systemPrompt: string): string;
    protected serializePromptOutput(output: unknown): string;
    protected buildLogPayload(input: IPromptParams, params: {
        model: string;
        systemPrompt: string;
        startedAt: Date;
        endedAt?: Date;
        inputTokens?: number;
        outputTokens?: number;
        tokens?: number;
        output?: unknown;
        success: boolean;
        errorMessage?: string;
    }): IAILogBase;
    protected registerPromptLog(input: IPromptParams, params: {
        model: string;
        systemPrompt: string;
        startedAt: Date;
        endedAt?: Date;
        inputTokens?: number;
        outputTokens?: number;
        tokens?: number;
        output?: unknown;
        success: boolean;
        errorMessage?: string;
    }): Promise<void>;
    generateEmbedding({ text, model }: {
        text: string;
        model: string;
    }): Promise<number[]>;
    prompt(input: IPromptParams): Promise<IPromptResponse>;
}
export default OpenAiProvider;
export { OpenAiProvider };
//# sourceMappingURL=OpenAiProvider.d.ts.map