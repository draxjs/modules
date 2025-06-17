import { ZodSchema } from 'zod'

type Role = 'user' | 'assistant' | 'system';

interface IPromptMessage {
    role: Role;
    content: string;
}

interface IPromptMemory {
    key: string;
    value: string;
}

interface IPromptParams {
    systemPrompt: string,
    userInput?: string,
    history?: IPromptMessage[],
    memory?: IPromptMemory[],
    memoryHeader?: string | '[MEMORY]' | '[MEMORIA]'
    knowledgeBase?: string[],
    knowledgeBaseHeader?: string | '[KNOWLEDGE BASE]' | '[BASE DE CONOCIMIENTO]',
    zodSchema?: ZodSchema<any>,
    jsonSchema?: object,
    model?: string,
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

export type {IAIProvider, IPromptParams, IPromptResponse, IPromptMessage, IPromptMemory}
