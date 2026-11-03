import {randomUUID} from "node:crypto";
import {DraxConfig} from "@drax/common-back";
import AiConfig from "../config/AiConfig.js";
import type {IPromptContentPart, IPromptImage, IPromptTool, IPromptToolNavigation} from "../interfaces/IAIProvider.js";
import type {
    DraxAgentAccessContext,
    DraxAgentKind,
    DraxAgentRoutingConfig,
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
} from "../interfaces/IDraxAgent.js";
import type {IPromptMessage} from "../interfaces/IAIProvider.js";
import type {IAgentSession, IAgentSessionBase} from "../interfaces/IAgentSession.js";
import AiProviderFactory from "../factory/ai/AiProviderFactory.js";
import AgentSessionServiceFactory from "../factory/services/AgentSessionServiceFactory.js";
import type {AgentSessionService} from "../services/AgentSessionService.js";
import {DraxAgentError} from "./DraxAgentError.js";
import {DraxAgentDiagnostics} from "./DraxAgentDiagnostics.js";

type SessionOwnership = Pick<DraxAgentSession, "ownerAgentIdentifier" | "conversationType" | "lastResolvedAgentIdentifier">;
type StoredAgentSession = IAgentSession & SessionOwnership;
type SessionClaim = {
    ownerAgentIdentifier: string;
    conversationType: DraxAgentKind;
    userId: string | null;
    tenantId: string | null;
};

class DraxAgent {
    // Process-local protection only; distributed deployments need a shared lock/unique sessionId.
    private static inFlightSessions = new Set<string>();
    private static crudReservations = new Set<string>();
    private static sessionClaims = new Map<string, SessionClaim>();
    private static indeterminateSessions = new Set<string>();
    protected sessions: Map<string, DraxAgentSession> = new Map();
    protected config: DraxAgentConfig = {
        systemPrompt: "Sos un asistente del sistema. Respondé siempre en texto plano. No uses emojis, markdown, asteriscos, ni símbolos decorativos.",
    };

    constructor(
        public readonly identifier: string = "default",
        public readonly description: string = "",
    ) {
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

    get type(): DraxAgentKind {
        return "specialist";
    }

    get routing(): DraxAgentRoutingConfig | undefined {
        return this.cloneData(this.config.routing);
    }

    async canAccess(context?: DraxAgentAccessContext): Promise<boolean> {
        if (this.config.routing?.enabled === false) {
            return false;
        }
        const access = this.config.access;
        if (!access) {
            return true;
        }
        const restricted = access.requireUser || access.requireTenant || access.permissions?.length || access.authorize;
        if (!context) {
            return !restricted;
        }
        const trusted = this.cloneData(context);
        if (access.requireUser && (!trusted.userId || trusted.authenticated === false)) {
            return false;
        }
        if (access.requireTenant && !trusted.tenantId) {
            return false;
        }
        if (access.permissions?.some(permission => !trusted.permissions?.includes(permission))) {
            return false;
        }
        try {
            return access.authorize ? await access.authorize(trusted) === true : true;
        } catch {
            return false;
        }
    }

    async assertAgentAccess(context?: DraxAgentAccessContext): Promise<void> {
        if (!await this.canAccess(context)) {
            throw new DraxAgentError({
                code: "AGENT_ACCESS_DENIED", statusCode: 403, stage: "access",
                message: "Access to this agent is denied.",
            });
        }
    }

    /** HTTP mutation guards must also protect legacy sessions already claimed or currently resolving. */
    static isSessionProtected(sessionId: string): boolean {
        return DraxAgent.sessionClaims.has(sessionId)
            || DraxAgent.inFlightSessions.has(sessionId)
            || DraxAgent.indeterminateSessions.has(sessionId);
    }

    /** Process-local, fail-fast exclusion with core operations and other HTTP mutations.
     * The action must revalidate ownership/identity under the reservation and await the actual write.
     * Reservations are not claims and intentionally do not count in isSessionProtected.
     */
    static async withSessionReservation<T>(sessionId: string, action: () => T | Promise<T>): Promise<T> {
        DraxAgent.assertSessionAvailable(sessionId);
        DraxAgent.crudReservations.add(sessionId);
        try {
            return await action();
        } finally {
            DraxAgent.crudReservations.delete(sessionId);
        }
    }

    /** Clears local history only, never the process-wide ownership or uncertain-operation claims. */
    clearSessions(): this {
        this.sessions.clear();
        return this;
    }

    async startSession(input: DraxAgentSessionInput = {}): Promise<DraxAgentSession> {
        const snapshot = this.cloneData({...input, sessionId: input.sessionId ?? randomUUID()});
        return this.withSessionLock(snapshot.sessionId, undefined, async () => {
            await this.assertAgentAccess(snapshot.accessContext);
            try {
                return await this.resolveSession(snapshot);
            } catch (error) {
                throw this.controlledError(error, "SESSION_RESOLUTION_FAILED", "Unable to resolve the session.", "session");
            }
        });
    }

    getSession(input: DraxAgentSessionInput): DraxAgentSession | null {
        if (!input.sessionId) {
            return null;
        }
        this.assertSessionClaim(input);
        const session = this.sessions.get(this.getSessionKey(input.userId, input.tenantId, input.sessionId)) ?? null;
        if (session) {
            this.assertSessionOwnership(session, input);
        }
        return session;
    }

    async sendMessage(input: DraxAgentMessageInput): Promise<DraxAgentMessageOutput> {
        const started = Date.now();
        const snapshot = this.cloneData({
            ...input,
            sessionId: input.sessionId ?? randomUUID(),
            correlationId: randomUUID(),
        });
        return this.withSessionLock(snapshot.sessionId, snapshot.correlationId, async () => {
            let stage = "access";
            let resolvedSessionId: string | undefined;
            try {
                await this.assertAgentAccess(snapshot.accessContext);
                stage = "session";
                const session = await this.resolveSession(snapshot);
                resolvedSessionId = session.id;
                stage = "turn";
                const turn = this.cloneData(await this.executeTurn(this.cloneData(snapshot), {
                    session: this.cloneData(session), input: this.cloneData(snapshot),
                }));
                const now = new Date();
                const updated = this.cloneData(session);
                const metadata = {
                    correlationId: snapshot.correlationId,
                    ...(turn.resolvedAgentIdentifier !== undefined ? {resolvedAgentIdentifier: turn.resolvedAgentIdentifier} : {}),
                };
                const userContent = snapshot.userContent || snapshot.userImages?.length
                    ? this.combineHistoryUserContent(snapshot.message, snapshot.userContent, snapshot.userImages)
                    : undefined;
                updated.messages.push({
                    role: "user", content: snapshot.message, createdAt: now, ...metadata,
                    ...(userContent ? {userContent} : {}),
                    ...(snapshot.inputFiles ? {inputFiles: this.cloneData(snapshot.inputFiles)} : {}),
                });
                updated.messages.push({role: "assistant", content: turn.message, createdAt: now, ...metadata});
                updated.updatedAt = now;
                if (turn.resolvedAgentIdentifier !== undefined) {
                    updated.lastResolvedAgentIdentifier = turn.resolvedAgentIdentifier;
                }
                try {
                    await this.persistSessionUpdate(updated, {
                        lastMessageAt: now, tokens: turn.tokens,
                        inputTokens: turn.inputTokens, outputTokens: turn.outputTokens,
                    });
                } catch (error) {
                    // The provider/tools have already run: neither rollback nor replay is safe.
                    DraxAgent.indeterminateSessions.add(session.id);
                    this.sessions.delete(this.getSessionKey(session.userId, session.tenantId, session.id));
                    throw new DraxAgentError({
                        code: "SESSION_PERSISTENCE_INDETERMINATE", statusCode: 500,
                        correlationId: snapshot.correlationId, sessionId: resolvedSessionId,
                        stage: "persistence", operationMayHaveCompleted: true, cause: error,
                        message: "The turn ran but its persistence could not be confirmed. Do not retry this operation.",
                    });
                }
                Object.assign(session, updated);
                const totalTime = Date.now() - started;
                return {
                    ...turn,
                    ...(this.type === "router" ? {time: totalTime, metrics: {...turn.metrics, totalTime}} : {}),
                    agentIdentifier: this.identifier, sessionId: session.id, correlationId: snapshot.correlationId,
                };
            } catch (error) {
                throw this.controlledError(error, "AGENT_MESSAGE_FAILED", "Unable to complete the agent message.", stage, snapshot.correlationId, resolvedSessionId);
            }
        });
    }

    /** Executes one authorized turn on detached data; never resolves, caches or persists a session. */
    public async executeTurn(input: DraxAgentMessageInput, context: DraxAgentPromptContext): Promise<DraxAgentTurnOutput> {
        input = this.cloneData(input);
        context = this.cloneData({...context, input});
        let stage = "access";
        try {
            await this.assertAgentAccess(input.accessContext);
            const session = context.session;
            stage = "prompt";
            const toolBuilders = await this.resolveToolBuilders(this.cloneData(context));
            const navigationState: {path: string | null} = {path: null};
            const tools = this.prepareTools([
                ...toolBuilders.flatMap(builder => builder.getTools()),
                ...await this.resolveTools(this.cloneData(context)),
            ], session.id, navigationState);

            const systemPrompt = await this.buildSystemPrompt(this.cloneData(context), toolBuilders);
            stage = "provider";
            const response = await this.getProvider().prompt({
                systemPrompt,
                userInput: input.message,
                userImages: input.userImages,
                userContent: input.userContent,
                inputFiles: input.inputFiles,
                history: this.cloneData(session.messages.slice(-(this.config.historyLimit ?? 20)).map(message => ({
                    role: message.role,
                    content: message.userContent?.length
                        ? this.combineHistoryUserContent(message.content, message.userContent)
                        : message.content,
                }))),
                memory: input.memory,
                memoryHeader: input.memoryHeader,
                knowledgeBase: input.knowledgeBase,
                knowledgeBaseHeader: input.knowledgeBaseHeader,
                tools,
                toolMaxIterations: input.toolMaxIterations ?? this.config.toolMaxIterations,
                model: input.model ?? this.config.model,
                operationTitle: input.operationTitle ?? this.config.operationTitle ?? "drax-agent-message",
                operationGroup: input.operationGroup ?? this.config.operationGroup ?? "drax-agent",
                ip: input.ip,
                userAgent: input.userAgent,
                tenant: input.tenantId ?? session.tenantId ?? null,
                user: input.userId ?? session.userId ?? null,
                audioResponse: input.audioResponse,
            });

            stage = "normalize";
            const assistantMessage = this.normalizeOutput(this.cloneData(response.output));
            return {
                ...(input.correlationId ? {correlationId: input.correlationId} : {}),
                message: assistantMessage,
                navigationPath: navigationState.path,
                output: response.output,
                tokens: response.tokens,
                inputTokens: response.inputTokens,
                outputTokens: response.outputTokens,
                time: response.time,
                ...(response.audio ? {audio: response.audio} : {}),
            };
        } catch (error) {
            throw this.controlledError(error, "AGENT_TURN_FAILED", "Unable to execute the agent turn.", stage, input.correlationId);
        }
    }

    protected async createSession(input: DraxAgentSessionInput = {}): Promise<DraxAgentSession> {
        const session: DraxAgentSession = {
            id: input.sessionId ?? randomUUID(),
            userId: input.userId ?? null,
            tenantId: input.tenantId ?? null,
            ownerAgentIdentifier: this.identifier,
            conversationType: this.type,
            messages: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        this.claimSession(session);
        await this.persistSessionCreate(session);
        this.sessions.set(this.getSessionKey(session.userId, session.tenantId, session.id), session);
        return session;
    }

    protected async resolveSession(input: DraxAgentSessionInput): Promise<DraxAgentSession> {
        if (!input.sessionId) {
            return this.createSession(input);
        }

        this.assertSessionClaim(input);
        const existingSession = this.getSession(input);
        if (existingSession) {
            return existingSession;
        }

        const persistedSession = await this.findPersistedSession(input);
        if (persistedSession) {
            const session = this.hydrateSession(persistedSession, input);
            this.claimSession(session);
            this.sessions.set(this.getSessionKey(session.userId, session.tenantId, session.id), session);
            return session;
        }

        return this.createSession(input);
    }

    protected async persistSessionCreate(session: DraxAgentSession): Promise<void> {
        const sessionService = this.getSessionService();
        if (!sessionService) {
            return;
        }

        const record = await sessionService.create(this.buildSessionPayload(session, {
            messageCount: 0,
            inputTokens: 0,
            outputTokens: 0,
            tokens: 0,
        }));

        session.recordId = this.stringifyRecordId(record);
        if (!session.recordId) {
            throw new Error("Session creation was not confirmed");
        }
    }

    protected async persistSessionUpdate(
        session: DraxAgentSession,
        usage: Pick<IAgentSessionBase, "lastMessageAt" | "tokens" | "inputTokens" | "outputTokens">,
    ): Promise<void> {
        const sessionService = this.getSessionService();
        if (!sessionService) {
            return;
        }

        if (!session.recordId) {
            const record = await this.findPersistedSession({
                sessionId: session.id,
                userId: session.userId,
                tenantId: session.tenantId,
            });
            session.recordId = this.stringifyRecordId(record);
        }

        if (!session.recordId) {
            throw new Error("Session record is unavailable");
        }

        const storedUsage = await this.resolveStoredUsage(session.recordId);

        const updated = await sessionService.updatePartial(session.recordId, this.buildSessionPayload(session, {
            lastMessageAt: usage.lastMessageAt,
            messageCount: session.messages.length,
            inputTokens: storedUsage.inputTokens + (usage.inputTokens ?? 0),
            outputTokens: storedUsage.outputTokens + (usage.outputTokens ?? 0),
            tokens: storedUsage.tokens + (usage.tokens ?? 0),
        }));
        if (!updated) {
            throw new Error("Session update was not confirmed");
        }
    }

    protected buildSessionPayload(session: DraxAgentSession, overrides: Partial<IAgentSessionBase> = {}): IAgentSessionBase & SessionOwnership {
        return {
            sessionId: session.id,
            ownerAgentIdentifier: session.ownerAgentIdentifier,
            conversationType: session.conversationType,
            lastResolvedAgentIdentifier: session.lastResolvedAgentIdentifier,
            title: this.resolveSessionTitle(session.messages),
            lastMessageAt: session.messages.length > 0 ? session.updatedAt : null,
            messages: session.messages.map(message => ({
                ...this.cloneData(message),
                content: this.stringifyMessageContent(message.content),

                createdAt: message.createdAt ?? session.updatedAt,
            })),
            messageCount: session.messages.length,
            inputTokens: 0,
            outputTokens: 0,
            tokens: 0,
            tenant: session.tenantId ?? null,
            user: session.userId ?? null,
            ...overrides,
        };
    }

    protected async findPersistedSession(input: DraxAgentSessionInput): Promise<StoredAgentSession | null> {
        if (!input.sessionId) {
            return null;
        }

        const sessionService = this.getSessionService();
        if (!sessionService) {
            return null;
        }

        // Never hide an existing session behind scope filters, including null/anonymous scopes.
        const sessions = await sessionService.findBy("sessionId", input.sessionId, 2);
        if ((sessions?.length ?? 0) > 1) {
            throw new DraxAgentError({
                code: "SESSION_CONFLICT", statusCode: 409, stage: "session",
                message: "The session identifier is ambiguous.",
            });
        }
        const record: StoredAgentSession | null = sessions?.[0] ?? null;
        if (record) {
            this.assertSessionOwnership({
                userId: this.stringifyRelationId(record.user),
                tenantId: this.stringifyRelationId(record.tenant),
                ownerAgentIdentifier: record.ownerAgentIdentifier,
                conversationType: record.conversationType,
            }, input);
        }
        return record;
    }

    protected hydrateSession(record: StoredAgentSession, input: DraxAgentSessionInput): DraxAgentSession {
        this.assertSessionOwnership({
            userId: this.stringifyRelationId(record.user), tenantId: this.stringifyRelationId(record.tenant),
            ownerAgentIdentifier: record.ownerAgentIdentifier, conversationType: record.conversationType,
        }, input);
        const session: DraxAgentSession = {
            id: record.sessionId,
            recordId: this.stringifyRecordId(record),
            userId: this.stringifyRelationId(record.user),
            tenantId: this.stringifyRelationId(record.tenant),
            ownerAgentIdentifier: record.ownerAgentIdentifier,
            conversationType: record.conversationType,
            lastResolvedAgentIdentifier: record.lastResolvedAgentIdentifier,
            messages: this.normalizeStoredMessages(record.messages ?? []),
            createdAt: record.createdAt ? new Date(record.createdAt) : new Date(),
            updatedAt: record.updatedAt ? new Date(record.updatedAt) : new Date(),
        };

        return session;
    }

    protected normalizeStoredMessages(messages: Array<{
        role: string; content: string;
    } & Partial<Omit<DraxAgentSessionMessage, "role" | "content">>>): DraxAgentSessionMessage[] {
        return (messages ?? [])
            .filter(message => message.role === "user" || message.role === "assistant" || message.role === "system")
            .map(message => ({
                ...this.cloneData(message),
                role: message.role as IPromptMessage["role"],
                ...(message.createdAt ? {createdAt: new Date(message.createdAt)} : {}),
            }));
    }

    protected async resolveStoredUsage(recordId: string): Promise<Required<Pick<IAgentSessionBase, "inputTokens" | "outputTokens" | "tokens">>> {
        const sessionService = this.getSessionService();
        if (!sessionService) {
            return {inputTokens: 0, outputTokens: 0, tokens: 0};
        }

        const record = await sessionService.findById(recordId);
        if (!record) {
            throw new Error("Stored session usage is unavailable");
        }
        return {
            inputTokens: this.normalizeNumber(record?.inputTokens),
            outputTokens: this.normalizeNumber(record?.outputTokens),
            tokens: this.normalizeNumber(record?.tokens),
        };
    }

    protected normalizeNumber(value: any): number {
        return typeof value === "number" && Number.isFinite(value) ? value : 0;
    }

    protected resolveSessionTitle(messages: IPromptMessage[]): string | undefined {
        const firstUserMessage = messages.find(message => message.role === "user");
        if (!firstUserMessage) {
            return undefined;
        }

        const title = this.stringifyMessageContent(firstUserMessage.content).trim();
        return title.length > 80 ? `${title.slice(0, 77)}...` : title;
    }

    protected combineHistoryUserContent(
        content: IPromptMessage["content"],
        userContent: IPromptContentPart[] = [],
        userImages: IPromptImage[] = [],
    ): IPromptContentPart[] {
        const parts = this.cloneData(userContent);
        const samePart = (left: IPromptContentPart, right: IPromptContentPart): boolean =>
            left.type === "text" && right.type === "text"
                ? left.text === right.text
                : left.type === "image" && right.type === "image"
                    && left.imageUrl === right.imageUrl && (left.detail ?? "auto") === (right.detail ?? "auto");
        const original: IPromptContentPart[] = typeof content === "string" ? [{type: "text", text: content}] : content;
        // Keep all existing metadata parts; add only original content not already represented there.
        parts.unshift(...this.cloneData(original.filter(part => !parts.some(existing => samePart(existing, part)))));
        for (const image of userImages) {
            const part: IPromptContentPart = {type: "image", imageUrl: image.url, ...(image.detail ? {detail: image.detail} : {})};
            if (!parts.some(existing => samePart(existing, part))) {
                parts.push(part);
            }
        }
        return parts;
    }

    protected stringifyMessageContent(content: IPromptMessage["content"]): string {
        return typeof content === "string" ? content : JSON.stringify(content);
    }

    protected stringifyRecordId(record: IAgentSession | null | undefined): string | null {
        return this.stringifyNavigationId(record?._id ?? (record as any)?.id);
    }

    protected stringifyRelationId(value: any): string | null {
        return this.stringifyNavigationId(value?._id ?? value?.id ?? value);
    }

    protected getSessionService(): AgentSessionService | null {
        if (this.config.sessionService === false) {
            return null;
        }

        return this.config.sessionService ?? AgentSessionServiceFactory.instance;
    }

    protected getSessionKey(userId: string | null | undefined, tenantId: string | null | undefined, sessionId: string): string {
        return JSON.stringify([tenantId ?? null, userId ?? null, sessionId]);
    }

    protected cloneData<T>(value: T): T {
        return structuredClone(value);
    }

    private static assertSessionAvailable(sessionId: string, correlationId?: string): void {
        if (DraxAgent.inFlightSessions.has(sessionId) || DraxAgent.crudReservations.has(sessionId)) {
            throw new DraxAgentError({
                code: "SESSION_BUSY", statusCode: 409, correlationId, stage: "session",
                message: "Another operation is already running for this session.",
            });
        }
    }

    private async withSessionLock<T>(sessionId: string, correlationId: string | undefined, action: () => Promise<T>): Promise<T> {
        DraxAgent.assertSessionAvailable(sessionId, correlationId);
        DraxAgent.inFlightSessions.add(sessionId);
        try {
            return await action();
        } finally {
            DraxAgent.inFlightSessions.delete(sessionId);
        }
    }

    private assertSessionClaim(input: DraxAgentSessionInput): void {
        const claim = DraxAgent.sessionClaims.get(input.sessionId);
        if (claim) {
            this.assertSessionOwnership(claim, input);
        }
        if (DraxAgent.indeterminateSessions.has(input.sessionId)) {
            throw new DraxAgentError({
                code: "SESSION_PERSISTENCE_INDETERMINATE", statusCode: 500,
                sessionId: input.sessionId, stage: "persistence", operationMayHaveCompleted: true,
                message: "Session persistence is uncertain. Reconcile the stored operation before continuing.",
            });
        }
    }

    private assertSessionOwnership(
        session: SessionOwnership & Pick<DraxAgentSession, "userId" | "tenantId">,
        input: DraxAgentSessionInput,
    ): void {
        const legacy = session.ownerAgentIdentifier == null && session.conversationType == null;
        if ((session.userId ?? null) !== (input.userId ?? null)
            || (session.tenantId ?? null) !== (input.tenantId ?? null)
            || (legacy ? this.type !== "specialist" : (
                session.ownerAgentIdentifier !== this.identifier || session.conversationType !== this.type
            ))) {
            throw new DraxAgentError({
                code: "SESSION_ACCESS_DENIED", statusCode: 403, stage: "session",
                message: "The session does not belong to this agent and access scope.",
            });
        }
    }

    private claimSession(session: DraxAgentSession): void {
        const input = {sessionId: session.id, userId: session.userId, tenantId: session.tenantId};
        this.assertSessionClaim(input);
        DraxAgent.sessionClaims.set(session.id, {
            ownerAgentIdentifier: this.identifier, conversationType: this.type,
            userId: session.userId ?? null, tenantId: session.tenantId ?? null,
        });
    }

    protected controlledError(error: unknown, code: string, message: string, stage: string, correlationId?: string, sessionId?: string, diagnosticProvider?: unknown): DraxAgentError {
        let controlled: DraxAgentError;
        if (error instanceof DraxAgentError) {
            const denied = error.code === "AGENT_ACCESS_DENIED" || error.code === "SESSION_ACCESS_DENIED";
            // A claim-based indeterminate failure has already checked owner/scope, even before hydration.
            const safeSessionId = denied ? undefined : sessionId ?? (
                error.code === "SESSION_PERSISTENCE_INDETERMINATE" ? error.sessionId : undefined
            );
            controlled = new DraxAgentError({
                code: error.code, message: error.message, statusCode: error.statusCode,
                stage: error.stage ?? stage, correlationId: correlationId ?? error.correlationId ?? randomUUID(),
                sessionId: safeSessionId, operationMayHaveCompleted: error.operationMayHaveCompleted, cause: error,
            });
        } else {
            controlled = new DraxAgentError({code, message, statusCode: 500, stage, correlationId: correlationId ?? randomUUID(), sessionId, cause: error});
        }
        this.reportError(controlled, diagnosticProvider);
        return controlled;
    }

    protected reportError(error: DraxAgentError, diagnosticProvider?: unknown): void {
        DraxAgentDiagnostics.report(error, {
            agentIdentifier: this.identifier,
            agentType: this.type,
            code: error.code,
            stage: error.stage,
            correlationId: error.correlationId,
            // Diagnostics must not initialize another provider, or mistake a TTS failure for an LLM failure.
            ...(error.stage === "audio" ? {} : {
                provider: diagnosticProvider === undefined ? this.config.provider : diagnosticProvider,
                providerName: DraxConfig.get(AiConfig.AiProvider) ?? process.env.AI_PROVIDER ?? "OpenAi",
            }),
        });
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
            name: tool.name,
            description: tool.description,
            parameters: this.cloneData(tool.parameters),
            navigation: this.cloneData(tool.navigation),
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

        if (["findById", "findOneBy", "findOne", "findBy", "fetchAll", "findFirst", "findLast", "search", "find", "paginate"].includes(method)) {
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
