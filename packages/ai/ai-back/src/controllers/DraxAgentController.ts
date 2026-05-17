import {z} from "zod";
import {CommonController} from "@drax/common-back";
import {DraxAgent} from "../agents/DraxAgent.js";
import DraxAgentFactory from "../factory/DraxAgentFactory.js";
import {AgentPermissions} from "../permissions/AgentPermissions.js";
import type {DraxAgentControllerOptions} from "../interfaces/IDraxAgentController.js";

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

const AgentSessionRequestSchema = z.object({
    identifier: z.string().min(1).optional(),
    sessionId: z.string().optional(),
    userId: z.string().optional().nullable(),
    tenantId: z.string().optional().nullable(),
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
        DraxAgentFactory.instance(this.defaultAgentIdentifier, this.defaultAgentDescription);
    }

    async agents(request, reply) {
        try {
            this.assertAccess(request);

            return reply.send({
                agents: DraxAgentFactory.agents().map(agent => ({
                    identifier: agent.identifier,
                    description: agent.description,
                })),
            });
        } catch (e: any) {
            this.handleControllerError(e, reply);
        }
    }

    async startSession(request, reply) {
        try {
            this.assertAccess(request);

            const input = AgentSessionRequestSchema.parse(request.body ?? {});
            const agent = this.resolveAgent(input.identifier);
            const session = await agent.startSession({
                sessionId: input.sessionId,
                userId: this.resolveUserId(request, input.userId),
                tenantId: this.resolveTenantId(request, input.tenantId),
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
            const agent = this.resolveAgent(input.identifier);
            const response = await agent.sendMessage({
                ...input,
                userId: this.resolveUserId(request, input.userId),
                tenantId: this.resolveTenantId(request, input.tenantId),
                ip: request.ip,
                userAgent: request.headers["user-agent"],
            });

            return reply.send(response);
        } catch (e: any) {
            this.handleControllerError(e, reply);
        }
    }

    protected resolveAgent(identifier?: string): DraxAgent {
        return DraxAgentFactory.instance(identifier ?? this.defaultAgentIdentifier);
    }

    protected assertAccess(request: any) {
        if (this.permission === false) {
            return;
        }

        request.rbac.assertPermission(this.permission);
    }

    protected resolveUserId(request: any, userId?: string | null) {
        return request.rbac?.userId ?? userId ?? null;
    }

    protected resolveTenantId(request: any, tenantId?: string | null) {
        return request.rbac?.tenantId ?? tenantId ?? null;
    }

    protected handleControllerError(e: any, reply: any) {
        if (e?.name === "ZodError") {
            return reply.status(400).send({
                message: e?.message || "Drax agent validation error",
            });
        }

        this.handleError(e, reply);
    }
}

export default DraxAgentController;
export {DraxAgentController};
