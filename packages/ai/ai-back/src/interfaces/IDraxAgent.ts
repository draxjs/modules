import type {
    IAIProvider,
    IPromptAudioParams,
    IPromptAudioResponse,
    IPromptContentPart,
    IPromptImage,
    IPromptMemory,
    IPromptMessage,
    IPromptTool
} from "./IAIProvider.js";
import type {AgentSessionService} from "../services/AgentSessionService.js";

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

type DraxAgentKind = "specialist" | "router";

interface DraxAgentRoutingConfig {
    eligible?: boolean;
    enabled?: boolean;
    capabilities?: string;
    examples?: string[];
    recommended?: boolean;
}

interface DraxAgentAccessContext {
    userId: string | null;
    tenantId: string | null;
    permissions?: readonly string[];
    authenticated?: boolean;
}

interface DraxAgentAccessConfig {
    requireUser?: boolean;
    requireTenant?: boolean;
    permissions?: string[];
    authorize?: (context: DraxAgentAccessContext) => boolean | Promise<boolean>;
}

interface DraxAgentTurnError {
    code: string;
    message: string;
    statusCode?: number;
    stage?: string;
    operationMayHaveCompleted?: boolean;
    /** A secondary TTS failure must not trigger automatic synthesis retries. */
    audioFailed?: boolean;
}

type DraxAgentTurnMetrics = Record<string, number>;

interface DraxAgentConfig {
    routing?: DraxAgentRoutingConfig;
    access?: DraxAgentAccessConfig;
    /** Specialist/provider default. Routers must not forward their selection model to a specialist. */
    model?: string;
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
    sessionService?: AgentSessionService | false;
}

interface DraxAgentSessionInput {
    identifier?: string;
    sessionId?: string;
    userId?: string | null;
    tenantId?: string | null;
    /** Trusted backend context only; never parse this from an HTTP body. */
    accessContext?: DraxAgentAccessContext;
}

interface DraxAgentMessageInput extends DraxAgentSessionInput {
    message: string;
    /** Internal correlation; sendMessage always generates its own UUID. */
    correlationId?: string;
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
    audioResponse?: boolean | IPromptAudioParams;
}

interface DraxAgentMessageOutput {
    agentIdentifier: string;
    sessionId: string;
    message: string;
    navigationPath?: string | null;
    output: any;
    tokens: number;
    inputTokens: number;
    outputTokens: number;
    time: number;
    audio?: IPromptAudioResponse;
    resolvedAgentIdentifier?: string;
    correlationId?: string;
    error?: DraxAgentTurnError;
    metrics?: DraxAgentTurnMetrics;
}

type DraxAgentTurnOutput = Omit<DraxAgentMessageOutput, "agentIdentifier" | "sessionId">;

interface DraxAgentSessionMessage extends IPromptMessage {
    createdAt?: Date;
    correlationId?: string;
    resolvedAgentIdentifier?: string;
    /** Combined original text and multimodal parts for replay in provider history. */
    userContent?: IPromptContentPart[];
    /** Attachment descriptors only; IPromptMessage history cannot replay files or their binary contents. */
    inputFiles?: DraxAgentMessageInput["inputFiles"];
}

interface DraxAgentSession {
    id: string;
    recordId?: string | null;
    userId?: string | null;
    tenantId?: string | null;
    ownerAgentIdentifier?: string;
    conversationType?: DraxAgentKind;
    lastResolvedAgentIdentifier?: string;
    messages: DraxAgentSessionMessage[];
    createdAt: Date;
    updatedAt: Date;
}

interface DraxAgentPromptContext {
    session: DraxAgentSession;
    input?: DraxAgentMessageInput;
}

export type {
    DraxAgentKind,
    DraxAgentRoutingConfig,
    DraxAgentAccessContext,
    DraxAgentAccessConfig,
    DraxAgentTurnError,
    DraxAgentTurnMetrics,
    DraxAgentTurnOutput,
    DraxAgentSessionMessage,
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
