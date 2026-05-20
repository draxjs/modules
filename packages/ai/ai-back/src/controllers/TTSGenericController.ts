import {CommonController} from "@drax/common-back";
import TTSPermissions from "../permissions/TTSPermissions.js";
import {TTSRequestSchema} from "../schemas/TTSRequestSchema.js";
import TTSGenericService from "../services/TTSGenericService.js";

class TTSGenericController extends CommonController {
    protected service: TTSGenericService

    constructor(service: TTSGenericService = new TTSGenericService()) {
        super()
        this.service = service
    }

    async availableProviders(request, reply) {
        try {
            request.rbac.assertPermission(TTSPermissions.TextToSpeech)

            return reply.send({
                providers: this.service.availableProviders(),
            })
        } catch (e: any) {
            this.handleError(e, reply)
        }
    }

    async textToSpeech(request, reply) {
        try {
            request.rbac.assertPermission(TTSPermissions.TextToSpeech)

            const input = TTSRequestSchema.parse(request.body ?? {})
            const response = await this.service.textToSpeech(input, {
                ip: request.ip,
                userAgent: request.headers["user-agent"],
                tenant: request.rbac?.tenantId ?? null,
                user: request.rbac?.userId ?? null,
            })

            if (input.responseFormat === "base64") {
                return reply.send({
                    audio: response.audio.toString("base64"),
                    contentType: response.contentType,
                    meta: {
                        provider: response.provider,
                        model: response.model,
                        voiceId: response.voiceId,
                        outputFormat: response.outputFormat,
                        size: response.size,
                        time: response.time,
                    },
                })
            }

            return reply
                .header("Content-Type", response.contentType)
                .header("Content-Length", response.size)
                .send(response.audio)
        } catch (e: any) {
            if (e?.name === "ZodError") {
                return reply.status(400).send({
                    message: e?.message || "TTS validation error",
                })
            }

            this.handleError(e, reply)
        }
    }
}

export default TTSGenericController;
export {TTSGenericController};
