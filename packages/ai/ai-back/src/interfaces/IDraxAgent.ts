import type {
    IAIProvider,
    IPromptContentPart,
    IPromptImage,
    IPromptMemory,
    IPromptMessage,
    IPromptTool
} from "./IAIProvider.js";

type DraxAgentSystemPrompt =
    | string
    | ((context: DraxAgentPromptContext) => string | Promise<string>);

type DraxAgentToolSource =
    | IPromptTool[]
    | ((context: DraxAgentPromptContext) => IPromptTool[] | Promise<IPromptTool[]>);

interface DraxAgentToolBuilder {
    getTools(): IPromptTool[];
    getSystemPromptSection(): string;
}

type DraxAgentToolBuilderSource =
    | DraxAgentToolBuilder[]
    | ((context: DraxAgentPromptContext) => DraxAgentToolBuilder[] | Promise<DraxAgentToolBuilder[]>);

interface DraxAgentConfig {
    provider?: IAIProvider;
    systemPrompt?: DraxAgentSystemPrompt;
    toolBuilders?: DraxAgentToolBuilderSource;
    tools?: DraxAgentToolSource;
    historyLimit?: number;
    toolMaxIterations?: number;
    operationTitle?: string;
    operationGroup?: string;
    logToolExecution?: boolean;
    normalizeOutput?: (output: any) => string;
}

interface DraxAgentSessionInput {
    sessionId?: string;
    userId?: string | null;
    tenantId?: string | null;
}

interface DraxAgentMessageInput extends DraxAgentSessionInput {
    message: string;
    ip?: string;
    userAgent?: string;
    model?: string;
    userImages?: IPromptImage[];
    userContent?: IPromptContentPart[];
    inputFiles?: Array<{
        filename?: string;
        filepath?: string;
        size?: number | null;
        mimetype?: string;
        url?: string;
    }>;
    memory?: IPromptMemory[];
    memoryHeader?: string;
    knowledgeBase?: string[];
    knowledgeBaseHeader?: string;
    toolMaxIterations?: number;
    operationTitle?: string;
    operationGroup?: string;
}

interface DraxAgentMessageOutput {
    sessionId: string;
    message: string;
    output: any;
    tokens: number;
    inputTokens: number;
    outputTokens: number;
    time: number;
}

interface DraxAgentSession {
    id: string;
    userId?: string | null;
    tenantId?: string | null;
    messages: IPromptMessage[];
    createdAt: Date;
    updatedAt: Date;
}

interface DraxAgentPromptContext {
    session: DraxAgentSession;
    input?: DraxAgentMessageInput;
}

export type {
    DraxAgentConfig,
    DraxAgentMessageInput,
    DraxAgentMessageOutput,
    DraxAgentPromptContext,
    DraxAgentSession,
    DraxAgentSessionInput,
    DraxAgentSystemPrompt,
    DraxAgentToolBuilder,
    DraxAgentToolBuilderSource,
    DraxAgentToolSource,
};
