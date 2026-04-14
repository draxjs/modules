import {z} from "zod";
import {CommonController} from "@drax/common-back";
import AiProviderFactory from "../factory/AiProviderFactory.js";
import AIPermissions from "../permissions/AIPermissions.js";
import type {IPromptParams} from "../interfaces/IAIProvider.js";

const PromptImageSchema = z.object({
    url: z.string().min(1),
    detail: z.enum(["auto", "low", "high"]).optional(),
})

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
])

const PromptMessageSchema = z.object({
    role: z.enum(["user", "assistant", "system"]),
    content: z.union([
        z.string(),
        z.array(PromptContentPartSchema),
    ]),
})

const PromptMemorySchema = z.object({
    key: z.string().min(1),
    value: z.string(),
})

const PromptInputFileSchema = z.object({
    filename: z.string().optional(),
    filepath: z.string().optional(),
    size: z.number().nullable().optional(),
    mimetype: z.string().optional(),
    url: z.string().optional(),
})

const GenericPromptRequestSchema = z.object({
    systemPrompt: z.string().min(1),
    userInput: z.string().optional(),
    userImages: z.array(PromptImageSchema).optional(),
    inputFiles: z.array(PromptInputFileSchema).optional(),
    userContent: z.array(PromptContentPartSchema).optional(),
    history: z.array(PromptMessageSchema).optional(),
    memory: z.array(PromptMemorySchema).optional(),
    memoryHeader: z.string().optional(),
    knowledgeBase: z.array(z.string()).optional(),
    knowledgeBaseHeader: z.string().optional(),
    jsonSchema: z.record(z.string(), z.any()).or(z.array(z.any())).optional(),
    model: z.string().optional(),
    operationTitle: z.string().optional(),
    operationGroup: z.string().optional(),
})

class AIGenericController extends CommonController {

    async prompt(request, reply) {
        try {
            request.rbac.assertPermission(AIPermissions.Prompt)

            const input = GenericPromptRequestSchema.parse(request.body ?? {})
            const aiProvider = AiProviderFactory.instance()
            const promptInput: IPromptParams = {
                ...(input as IPromptParams),
                operationTitle: input.operationTitle ?? "generic-ai-prompt",
                operationGroup: input.operationGroup ?? "generic-ai-prompt",
                ip: request.ip,
                userAgent: request.headers["user-agent"],
                tenant: request.rbac?.tenantId ?? null,
                user: request.rbac?.userId ?? null,
            }

            const response = await aiProvider.prompt(promptInput)

            return reply.send(response)
        } catch (e: any) {
            if (e?.name === "ZodError") {
                return reply.status(400).send({
                    message: e?.message || "AI prompt validation error",
                })
            }

            this.handleError(e, reply)
        }
    }

}

export default AIGenericController;
export {AIGenericController};
