import {z} from "zod";
import {CommonController} from "@drax/common-back";
import type {DraxAgent} from "../agents/DraxAgent.js";
import {DraxAgentError} from "../agents/DraxAgentError.js";
import type {DraxAgentAccessContext} from "../interfaces/IDraxAgent.js";
import DraxAgentFactory from "../factory/DraxAgentFactory.js";
import {AgentPermissions} from "../permissions/AgentPermissions.js";
import type {
    DraxAgentControllerOptions,
    DraxAgentCatalogEntry,
    DraxAgentCatalogResponse,
} from "../interfaces/IDraxAgentController.js";

const PromptImageSchema = z.object({
    url: z.string().min(1),
    detail: z.enum(["auto", "low", "high"]).optional(),
});

const PromptContentPartSchema = z.discriminatedUnion("type", [
    z.object({
        type: z.literal("text"),
        text: z.string(),
    }),
    z.object({
        type: z.literal("image"),
        imageUrl: z.string().min(1),
        detail: z.enum(["auto", "low", "high"]).optional(),
    }),
]);

const PromptMemorySchema = z.object({
    key: z.string().min(1),
    value: z.string(),
});

const PromptInputFileSchema = z.object({
    filename: z.string().optional(),
    filepath: z.string().optional(),
    size: z.number().nullable().optional(),
    mimetype: z.string().optional(),
    url: z.string().optional(),
});

const PromptAudioVoiceSettingsSchema = z.object({
    stability: z.number().min(0).max(1).optional(),
    similarityBoost: z.number().min(0).max(1).optional(),
    style: z.number().min(0).max(1).optional(),
    useSpeakerBoost: z.boolean().optional(),
    speed: z.number().positive().optional(),
});

const PromptAudioParamsSchema = z.object({
    enabled: z.boolean().optional(),
    provider: z.string().optional(),
    voiceId: z.string().optional(),
    model: z.string().optional(),
    outputFormat: z.string().optional(),
    voiceSettings: PromptAudioVoiceSettingsSchema.optional(),
    previousText: z.string().optional(),
    nextText: z.string().optional(),
    languageCode: z.string().optional(),
    seed: z.number().int().optional(),
    operationTitle: z.string().optional(),
    operationGroup: z.string().optional(),
});

const AgentSessionRequestSchema = z.object({
    identifier: z.string().min(1).optional(),
    sessionId: z.string().optional(),

});

const AgentMessageRequestSchema = AgentSessionRequestSchema.extend({
    message: z.string().min(1),
    userImages: z.array(PromptImageSchema).optional(),
    userContent: z.array(PromptContentPartSchema).optional(),
    inputFiles: z.array(PromptInputFileSchema).optional(),
    memory: z.array(PromptMemorySchema).optional(),
    memoryHeader: z.string().optional(),
    knowledgeBase: z.array(z.string()).optional(),
    knowledgeBaseHeader: z.string().optional(),
    model: z.string().optional(),
    toolMaxIterations: z.number().optional(),
    operationTitle: z.string().optional(),
    operationGroup: z.string().optional(),
    audioResponse: z.union([z.boolean(), PromptAudioParamsSchema]).optional(),
});

class DraxAgentController extends CommonController {
    protected permission: string | false;
    protected defaultAgentIdentifier: string;
    protected defaultAgentDescription: string;

    constructor(options: DraxAgentControllerOptions = {}) {
        super();
        this.permission = options.permission ?? AgentPermissions.Session;
        this.defaultAgentIdentifier = options.agentIdentifier ?? "default";
        this.defaultAgentDescription = options.agentDescription ?? "";
        // Explicit identifiers may be registered later during bootstrap. Never replace a router.
        if (options.agentIdentifier === undefined && !DraxAgentFactory.lookup(this.defaultAgentIdentifier)) {
            DraxAgentFactory.instance(this.defaultAgentIdentifier, this.defaultAgentDescription);
        }
    }

    async agents(request, reply) {
        try {
            this.assertAccess(request);

            const accessContext = this.resolveAccessContext(request);
            const response: DraxAgentCatalogResponse = {agents: []};
            for (const agent of DraxAgentFactory.agents()) {
                const routing = agent.routing;
                if (routing?.enabled === false || !await agent.canAccess(accessContext)) {
                    continue;
                }

                const entry: DraxAgentCatalogEntry = {
                    identifier: agent.identifier,
                    description: agent.description,
                };
                if (agent.type === "router" || routing !== undefined) {
                    entry.type = agent.type;
                    if (routing !== undefined) {
                        entry.routing = {
                            eligible: routing.eligible,
                            enabled: routing.enabled,
                            capabilities: routing.capabilities,
                            examples: routing.examples ? [...routing.examples] : undefined,
                            recommended: routing.recommended,
                        };
                    }
                }
                response.agents.push(entry);
                if (agent.type === "router" && routing?.recommended === true && !response.recommendedAgentIdentifier) {
                    response.recommendedAgentIdentifier = agent.identifier;
                }
            }

            return reply.send(response);
        } catch (e: any) {
            this.handleControllerError(e, reply);
        }
    }

    async startSession(request, reply) {
        try {
            this.assertAccess(request);

            const input = AgentSessionRequestSchema.parse(request.body ?? {});
            const accessContext = this.resolveAccessContext(request);
            const agent = this.resolveAgent(input.identifier);
            await agent.assertAgentAccess(accessContext);
            const session = await agent.startSession({
                sessionId: input.sessionId,
                userId: accessContext.userId,
                tenantId: accessContext.tenantId,
                accessContext,
            });

            return reply.send({
                agentIdentifier: agent.identifier,
                sessionId: session.id,
                createdAt: session.createdAt,
                updatedAt: session.updatedAt,
            });
        } catch (e: any) {
            this.handleControllerError(e, reply);
        }
    }

    async message(request, reply) {
        try {
            this.assertAccess(request);

            const input = AgentMessageRequestSchema.parse(request.body ?? {});
            const accessContext = this.resolveAccessContext(request);
            const agent = this.resolveAgent(input.identifier);
            await agent.assertAgentAccess(accessContext);
            const response = await agent.sendMessage({
                ...input,
                userId: accessContext.userId,
                tenantId: accessContext.tenantId,
                accessContext,
                ip: request.ip,
                userAgent: request.headers["user-agent"],
            });

            if (response.error) {
                return reply.status(response.error.statusCode ?? 502).send(response);
            }
            return reply.send(response);
        } catch (e: any) {
            this.handleControllerError(e, reply);
        }
    }

    protected resolveAgent(identifier?: string): DraxAgent {
        const agent = DraxAgentFactory.lookup(identifier ?? this.defaultAgentIdentifier);
        if (!agent) {
            throw new DraxAgentError({
                code: "AGENT_NOT_FOUND", statusCode: 404,
                message: "Agent not found.",
            });
        }
        if (agent.routing?.enabled === false) {
            throw new DraxAgentError({
                code: "AGENT_ACCESS_DENIED", statusCode: 403, stage: "access",
                message: "Access to this agent is denied.",
            });
        }
        return agent;
    }

    protected assertAccess(request: any) {
        if (this.permission === false) {
            return;
        }

        if (typeof request.rbac?.assertPermission !== "function") {
            throw new DraxAgentError({
                code: "UNAUTHENTICATED", statusCode: 401, stage: "access",
                message: "Authentication is required.",
            });
        }
        request.rbac.assertPermission(this.permission);
    }

    protected resolveAccessContext(request: any): DraxAgentAccessContext {
        const rbac = request.rbac;
        // Anonymous RBAC implementations can throw when their getters dereference a null user/role.
        const read = (getter: () => unknown): unknown => {
            try {
                return getter();
            } catch {
                return undefined;
            }
        };
        const userId = read(() => rbac?.userId);
        const tenantId = read(() => rbac?.tenantId);
        const permissions = read(() => rbac?.getRole?.permissions);
        return {
            userId: typeof userId === "string" && userId.length > 0 ? userId : null,
            tenantId: typeof tenantId === "string" && tenantId.length > 0 ? tenantId : null,
            permissions: Array.isArray(permissions) && permissions.every(permission => typeof permission === "string")
                ? [...permissions] : [],
            authenticated: typeof userId === "string" && userId.length > 0,
        };
    }

    protected handleControllerError(e: any, reply: any) {
        if (e instanceof DraxAgentError) {
            const indeterminate = e.code === "SESSION_PERSISTENCE_INDETERMINATE";
            const denied = e.code === "AGENT_ACCESS_DENIED" || e.code === "SESSION_ACCESS_DENIED";
            const message = indeterminate
                ? `${e.message} The operation may have completed. Do not retry automatically; reconcile its persistence first.`
                : e.message;
            return reply.status(e.statusCode).send({
                message,
                ...(e.correlationId !== undefined ? {correlationId: e.correlationId} : {}),
                ...(!denied && e.sessionId !== undefined ? {sessionId: e.sessionId} : {}),
                error: {
                    code: e.code,
                    message,
                    ...(e.stage !== undefined ? {stage: e.stage} : {}),
                    ...(indeterminate || e.operationMayHaveCompleted !== undefined
                        ? {operationMayHaveCompleted: indeterminate || e.operationMayHaveCompleted} : {}),
                },
            });
        }
        if (e instanceof z.ZodError) {
            return reply.status(400).send({
                message: "Drax agent validation error",
            });
        }

        return this.handleError(e, reply);
    }
}

export default DraxAgentController;
export {DraxAgentController};
