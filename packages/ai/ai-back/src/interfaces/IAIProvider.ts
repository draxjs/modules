import { ZodSchema } from 'zod'

type Role = 'user' | 'assistant' | 'system';

type IPromptImageDetail = 'auto' | 'low' | 'high';

interface IPromptImage {
    url: string;
    detail?: IPromptImageDetail;
}

interface IPromptContentPartText {
    type: 'text';
    text: string;
}

interface IPromptContentPartImage {
    type: 'image';
    imageUrl: string;
    detail?: IPromptImageDetail;
}

type IPromptContentPart = IPromptContentPartText | IPromptContentPartImage;

interface IPromptMessage {
    role: Role;
    content: string | IPromptContentPart[];
}

interface IPromptMemory {
    key: string;
    value: string;
}

interface IPromptParams {
    systemPrompt: string,
    userInput?: string,
    userImages?: IPromptImage[],
    inputFiles?: Array<{
        filename?: string,
        filepath?: string,
        size?: number | null,
        mimetype?: string,
        url?: string
    }>,
    userContent?: IPromptContentPart[],
    history?: IPromptMessage[],
    memory?: IPromptMemory[],
    memoryHeader?: string | '[MEMORY]' | '[MEMORIA]'
    knowledgeBase?: string[],
    knowledgeBaseHeader?: string | '[KNOWLEDGE BASE]' | '[BASE DE CONOCIMIENTO]',
    zodSchema?: ZodSchema<any>,
    jsonSchema?: object,
    model?: string,
    operationTitle?: string,
    operationGroup?: string,
    ip?: string,
    userAgent?: string,
    tenant?: string | null,
    user?: string | null,
}

interface IPromptResponse {
    output: any,
    tokens: number,
    inputTokens: number,
    outputTokens: number,
    time: number
}

interface IAIProvider {
    prompt(input: IPromptParams): Promise<IPromptResponse>
}

export type {
    IAIProvider,
    IPromptParams,
    IPromptResponse,
    IPromptMessage,
    IPromptMemory,
    IPromptImage,
    IPromptImageDetail,
    IPromptContentPart,
    IPromptContentPartImage,
    IPromptContentPartText,
}
