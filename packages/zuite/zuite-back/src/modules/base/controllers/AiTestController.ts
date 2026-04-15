import type { FastifyReply, FastifyRequest } from "fastify";
import { CommonController } from "@drax/common-back";
import { BadRequestError } from "@drax/common-back";
import {
    AiProviderFactory
} from "@drax/ai-back";
import type {
    IPromptContentPart,
    IPromptImage,
    IPromptMemory,
    IPromptMessage,
} from "@drax/ai-back";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

type VisionImageMode = "url" | "base64"

type PromptInputFile = {
    filename?: string
    filepath?: string
    size?: number | string | null
    mimetype?: string
    url?: string
}

type AiTestPromptBody = {
    systemPrompt: string
    userInput?: string
    inputFiles?: PromptInputFile[]
    history?: IPromptMessage[]
    memory?: IPromptMemory[]
    knowledgeBase?: string[]
    knowledgeBaseHeader?: string
    memoryHeader?: string
    userImages?: IPromptImage[]
    userContent?: IPromptContentPart[]
    jsonSchema?: object
    visionImageMode?: VisionImageMode
    visionDetail?: "auto" | "low" | "high"
    model?: string
    operationTitle?: string
    operationGroup?: string
}

type AiTestPromptRequest = FastifyRequest<{
    Body: AiTestPromptBody
}>

class AiTestController extends CommonController {

    protected isAbsolutePublicUrl(url?: string) {
        return !!url && /^https?:\/\//i.test(url)
    }

    protected async fileToBase64DataUrl(file: PromptInputFile) {
        if (!file.filepath) {
            throw new BadRequestError("inputFiles.filepath required for base64 mode")
        }

        const absolutePath = resolve(process.cwd(), file.filepath)
        const buffer = await readFile(absolutePath)
        const mimeType = file.mimetype || "application/octet-stream"
        return `data:${mimeType};base64,${buffer.toString("base64")}`
    }

    protected async buildUserImages(body: AiTestPromptBody): Promise<IPromptImage[] | undefined> {
        if (body.userImages && body.userImages.length > 0) {
            return body.userImages
        }

        if (!body.inputFiles || body.inputFiles.length === 0) {
            return undefined
        }

        const mode = body.visionImageMode ?? "url"
        const detail = body.visionDetail

        return await Promise.all(body.inputFiles.map(async (file) => {
            if (mode === "base64") {
                return {
                    url: await this.fileToBase64DataUrl(file),
                    ...(detail ? { detail } : {}),
                }
            }

            if (!this.isAbsolutePublicUrl(file.url)) {
                throw new BadRequestError("inputFiles.url must be a public absolute URL for url mode")
            }

            return {
                url: file.url as string,
                ...(detail ? { detail } : {}),
            }
        }))
    }

    protected normalizeInputFiles(inputFiles?: PromptInputFile[]) {
        if (!inputFiles || inputFiles.length === 0) {
            return undefined
        }

        return inputFiles.map(file => ({
            filename: file.filename,
            filepath: file.filepath,
            size: typeof file.size === "string" ? Number(file.size) : file.size ?? undefined,
            mimetype: file.mimetype,
            url: file.url,
        }))
    }

    async prompt(request: AiTestPromptRequest, reply: FastifyReply) {
        try {
            request.rbac?.assertAuthenticated()

            const body = request.body

            if (!body?.systemPrompt?.trim()) {
                reply.statusCode = 400
                return reply.send({ error: "systemPrompt required" })
            }

            const userImages = await this.buildUserImages(body)
            const inputFiles = this.normalizeInputFiles(body.inputFiles)
            const provider = AiProviderFactory.instance()
            return await provider.prompt({
                systemPrompt: body.systemPrompt,
                userInput: body.userInput,
                inputFiles,
                history: body.history,
                memory: body.memory,
                knowledgeBase: body.knowledgeBase,
                knowledgeBaseHeader: body.knowledgeBaseHeader,
                memoryHeader: body.memoryHeader,
                userImages,
                userContent: body.userContent,
                jsonSchema: body.jsonSchema,
                model: body.model,
                operationTitle: body.operationTitle ?? "AI Test Prompt",
                operationGroup: body.operationGroup ?? "AiTestPage",
                ip: request.ip,
                userAgent: request.headers["user-agent"],
                tenant: request.rbac?.tenantId ?? null,
                user: request.rbac?.userId ?? null,
            })
        } catch (e) {
            this.handleError(e, reply)
        }
    }

}

export default AiTestController
export {
    AiTestController
}
