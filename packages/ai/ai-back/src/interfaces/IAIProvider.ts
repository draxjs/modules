import { ZodSchema } from 'zod'
import type {ITTSVoiceSettings} from "./ITTSProvider.js";

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

interface IPromptTool {
    name: string;
    description: string;
    parameters?: object;
    execute: (args: any) => any | Promise<any>;
    navigation?: IPromptToolNavigation;
}

interface IPromptToolNavigation {
    entityName: string;
    method: string;
    basePath?: string;
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
    tools?: IPromptTool[],
    toolMaxIterations?: number,
    model?: string,
    operationTitle?: string,
    operationGroup?: string,
    ip?: string,
    userAgent?: string,
    tenant?: string | null,
    user?: string | null,
    audioResponse?: boolean | IPromptAudioParams,
}

interface IPromptAudioParams {
    enabled?: boolean,
    provider?: string,
    voiceId?: string,
    model?: string,
    outputFormat?: string,
    voiceSettings?: ITTSVoiceSettings,
    previousText?: string,
    nextText?: string,
    languageCode?: string,
    seed?: number,
    operationTitle?: string,
    operationGroup?: string,
}

interface IPromptAudioResponseMeta {
    provider: string,
    model: string,
    voiceId: string,
    outputFormat?: string,
    size: number,
    time: number,
}

interface IPromptAudioResponse {
    audio: string,
    contentType: string,
    encoding: 'base64',
    meta: IPromptAudioResponseMeta,
}

interface IPromptResponse {
    output: any,
    tokens: number,
    inputTokens: number,
    outputTokens: number,
    time: number,
    audio?: IPromptAudioResponse,
}

interface IAIProvider {
    prompt(input: IPromptParams): Promise<IPromptResponse>
}

export type {
    IAIProvider,
    IPromptParams,
    IPromptResponse,
    IPromptAudioParams,
    IPromptAudioResponse,
    IPromptAudioResponseMeta,
    IPromptMessage,
    IPromptMemory,
    IPromptTool,
    IPromptToolNavigation,
    IPromptImage,
    IPromptImageDetail,
    IPromptContentPart,
    IPromptContentPartImage,
    IPromptContentPartText,
}
