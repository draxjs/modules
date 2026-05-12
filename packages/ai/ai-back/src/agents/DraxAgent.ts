import {randomUUID} from "node:crypto";
import type {IPromptTool, IPromptToolNavigation} from "../interfaces/IAIProvider.js";
import type {
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
} from "../interfaces/IDraxAgent.js";
import AiProviderFactory from "../factory/AiProviderFactory.js";

class DraxAgent {
    private static singleton?: DraxAgent;

    protected sessions: Map<string, DraxAgentSession> = new Map();
    protected config: DraxAgentConfig = {
        systemPrompt: "Sos un asistente del sistema. Responde de forma clara, breve y util.",
    };

    private constructor() {
    }

    static instance(): DraxAgent {
        if (!DraxAgent.singleton) {
            DraxAgent.singleton = new DraxAgent();
        }

        return DraxAgent.singleton;
    }

    configure(config: DraxAgentConfig): this {
        this.config = {
            ...this.config,
            ...config,
        };

        return this;
    }

    setProvider(provider: DraxAgentConfig["provider"]): this {
        return this.configure({provider});
    }

    setSystemPrompt(systemPrompt: DraxAgentSystemPrompt): this {
        return this.configure({systemPrompt});
    }

    setToolBuilders(toolBuilders: DraxAgentToolBuilderSource): this {
        return this.configure({toolBuilders});
    }

    setTools(tools: DraxAgentToolSource): this {
        return this.configure({tools});
    }

    clearSessions(): this {
        this.sessions.clear();
        return this;
    }

    startSession(input: DraxAgentSessionInput = {}): DraxAgentSession {
        return this.createSession(input);
    }

    getSession(input: DraxAgentSessionInput): DraxAgentSession | null {
        if (!input.sessionId) {
            return null;
        }

        return this.sessions.get(this.getSessionKey(input.userId, input.tenantId, input.sessionId)) ?? null;
    }

    async sendMessage(input: DraxAgentMessageInput): Promise<DraxAgentMessageOutput> {
        const session = this.resolveSession(input);
        const context: DraxAgentPromptContext = {session, input};
        const toolBuilders = await this.resolveToolBuilders(context);
        const navigationState: {path: string | null} = {path: null};
        const tools = this.prepareTools([
            ...toolBuilders.flatMap(builder => builder.getTools()),
            ...await this.resolveTools(context),
        ], session.id, navigationState);

        const systemPrompt = await this.buildSystemPrompt(context, toolBuilders);
        const response = await this.getProvider().prompt({
            systemPrompt,
            userInput: input.message,
            userImages: input.userImages,
            userContent: input.userContent,
            inputFiles: input.inputFiles,
            history: session.messages.slice(-(this.config.historyLimit ?? 20)),
            memory: input.memory,
            memoryHeader: input.memoryHeader,
            knowledgeBase: input.knowledgeBase,
            knowledgeBaseHeader: input.knowledgeBaseHeader,
            tools,
            toolMaxIterations: input.toolMaxIterations ?? this.config.toolMaxIterations,
            model: input.model,
            operationTitle: input.operationTitle ?? this.config.operationTitle ?? "drax-agent-message",
            operationGroup: input.operationGroup ?? this.config.operationGroup ?? "drax-agent",
            ip: input.ip,
            userAgent: input.userAgent,
            tenant: input.tenantId ?? session.tenantId ?? null,
            user: input.userId ?? session.userId ?? null,
        });

        const assistantMessage = this.normalizeOutput(response.output);
        session.messages.push({role: "user", content: input.message});
        session.messages.push({role: "assistant", content: assistantMessage});
        session.updatedAt = new Date();

        return {
            sessionId: session.id,
            message: assistantMessage,
            navigationPath: navigationState.path,
            output: response.output,
            tokens: response.tokens,
            inputTokens: response.inputTokens,
            outputTokens: response.outputTokens,
            time: response.time,
        };
    }

    protected createSession(input: DraxAgentSessionInput = {}): DraxAgentSession {
        const session: DraxAgentSession = {
            id: input.sessionId ?? randomUUID(),
            userId: input.userId ?? null,
            tenantId: input.tenantId ?? null,
            messages: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        this.sessions.set(this.getSessionKey(session.userId, session.tenantId, session.id), session);
        return session;
    }

    protected resolveSession(input: DraxAgentSessionInput): DraxAgentSession {
        if (!input.sessionId) {
            return this.startSession(input);
        }

        const existingSession = this.getSession(input);
        if (existingSession) {
            return existingSession;
        }

        return this.createSession(input);
    }

    protected getSessionKey(userId: string | null | undefined, tenantId: string | null | undefined, sessionId: string): string {
        return `${tenantId ?? "global"}:${userId ?? "anonymous"}:${sessionId}`;
    }

    protected async buildSystemPrompt(context: DraxAgentPromptContext, toolBuilders: DraxAgentToolBuilder[]): Promise<string> {
        const systemPrompt = this.config.systemPrompt ?? "";
        const basePrompt = typeof systemPrompt === "function"
            ? await systemPrompt(context)
            : systemPrompt;
        const rbacSection = this.buildRbacContextSection(context);

        const toolSections = toolBuilders
            .map(builder => builder.getSystemPromptSection())
            .filter(section => section.trim().length > 0);

        return [
            basePrompt,
            rbacSection,
            toolSections.length > 0
                ? [
                    "[ENTIDADES Y TOOLS]",
                    ...toolSections,
                ].join("\n")
                : "",
        ].filter(section => section.trim().length > 0).join("\n\n");
    }

    protected buildRbacContextSection(context: DraxAgentPromptContext): string {
        const userId = context.input?.userId ?? context.session.userId ?? null;
        const tenantId = context.input?.tenantId ?? context.session.tenantId ?? null;

        if (!userId && !tenantId) {
            return "";
        }

        const lines = [
            "[CONTEXTO RBAC]",
            `tenantId: ${tenantId ?? "null"}`,
            `userId: ${userId ?? "null"}`,
            "Cuando necesites completar campos de pertenencia o auditoria como tenant, tenantId, user, userId o createdBy, usa estos valores del usuario autenticado. No los solicites al usuario ni inventes otros valores.",
        ];

        return lines.join("\n");
    }

    protected async resolveToolBuilders(context: DraxAgentPromptContext): Promise<DraxAgentToolBuilder[]> {
        if (!this.config.toolBuilders) {
            return [];
        }

        return typeof this.config.toolBuilders === "function"
            ? await this.config.toolBuilders(context)
            : this.config.toolBuilders;
    }

    protected async resolveTools(context: DraxAgentPromptContext): Promise<IPromptTool[]> {
        if (!this.config.tools) {
            return [];
        }

        return typeof this.config.tools === "function"
            ? await this.config.tools(context)
            : this.config.tools;
    }

    protected prepareTools(
        tools: IPromptTool[],
        sessionId: string,
        navigationState: {path: string | null},
    ): IPromptTool[] {
        return tools.map(tool => ({
            ...tool,
            execute: async (args: any) => {
                if (this.config.logToolExecution) {
                    console.log("[drax-agent] tool:start", {
                        sessionId,
                        tool: tool.name,
                        args,
                    });
                }

                try {
                    const result = await tool.execute(args);
                    navigationState.path = this.resolveNavigationPath(tool.navigation, args, result) ?? navigationState.path;

                    if (this.config.logToolExecution) {
                        console.log("[drax-agent] tool:success", {
                            sessionId,
                            tool: tool.name,
                            navigationPath: navigationState.path,
                        });
                    }

                    return result;
                } catch (error) {
                    if (this.config.logToolExecution) {
                        console.error("[drax-agent] tool:error", {
                            sessionId,
                            tool: tool.name,
                            error,
                        });
                    }

                    throw error;
                }
            },
        }));
    }

    protected resolveNavigationPath(navigation: IPromptToolNavigation | undefined, args: any, result: any): string | null {
        if (!navigation) {
            return null;
        }

        const mode = this.resolveNavigationMode(navigation.method);

        if (!mode) {
            return null;
        }

        const id = this.resolveNavigationId(navigation.method, args, result);

        if (!id) {
            return null;
        }

        const basePath = navigation.basePath ?? `/crud/${encodeURIComponent(navigation.entityName)}`;
        const query = new URLSearchParams({
            mode,
            id,
        });

        return `${basePath}?${query.toString()}`;
    }

    protected resolveNavigationMode(method: string): "edit" | "view" | null {
        if (["create", "update", "updatePartial"].includes(method)) {
            return "edit";
        }

        if (["findById", "findOneBy", "findOne", "findBy", "search", "find", "paginate"].includes(method)) {
            return "view";
        }

        return null;
    }

    protected resolveNavigationId(method: string, args: any, result: any): string | null {
        if (["update", "updatePartial", "findById"].includes(method)) {
            return this.stringifyNavigationId(args?.id) ?? this.extractRecordId(result);
        }

        return this.extractRecordId(result);
    }

    protected extractRecordId(result: any): string | null {
        const record = this.resolveSingleRecord(result);

        if (!record || typeof record !== "object") {
            return null;
        }

        return this.stringifyNavigationId(record.id)
            ?? this.stringifyNavigationId(record._id)
            ?? this.stringifyNavigationId(record.uuid);
    }

    protected resolveSingleRecord(result: any): any {
        if (Array.isArray(result)) {
            return result.length === 1 ? result[0] : null;
        }

        if (Array.isArray(result?.docs)) {
            return result.docs.length === 1 ? result.docs[0] : null;
        }

        if (Array.isArray(result?.items)) {
            return result.items.length === 1 ? result.items[0] : null;
        }

        if (Array.isArray(result?.data)) {
            return result.data.length === 1 ? result.data[0] : null;
        }

        return result;
    }

    protected stringifyNavigationId(id: any): string | null {
        if (id === null || id === undefined || id === "") {
            return null;
        }

        if (typeof id === "string" || typeof id === "number" || typeof id === "boolean") {
            return String(id);
        }

        if (typeof id?.toString === "function") {
            const value = id.toString();
            return value && value !== "[object Object]" ? value : null;
        }

        return null;
    }

    protected normalizeOutput(output: any): string {
        if (this.config.normalizeOutput) {
            return this.config.normalizeOutput(output);
        }

        if (typeof output === "string") {
            return output;
        }

        if (output?.message && typeof output.message === "string") {
            return output.message;
        }

        return JSON.stringify(output);
    }

    protected getProvider() {
        if (!this.config.provider) {
            this.config.provider = AiProviderFactory.instance()
        }

        return this.config.provider;
    }
}

export default DraxAgent;
export {DraxAgent};
