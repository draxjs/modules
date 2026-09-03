import {createReadStream} from "node:fs";
import {basename} from "node:path";
import type {FastifyReply} from "fastify";
import type {CustomRequest} from "@drax/crud-back";
import RecoveryPermissions from "../permissions/RecoveryPermissions.js";
import MongoRecoveryService from "../services/MongoRecoveryService.js";

type DumpBody = {
    masterPassword?: string;
};

type DownloadQuery = {
    archivePath?: string;
};

class MongoRecoveryController {
    private readonly service = new MongoRecoveryService();

    async dump(request: CustomRequest, reply: FastifyReply) {
        try {
            request?.rbac.assertAuthenticated();
            request?.rbac.assertPermission(RecoveryPermissions.Dump);

            const body = request.body as DumpBody;
            const result = await this.service.dump(body?.masterPassword || "");

            return reply.status(200).send({
                success: true,
                message: "Dump generado correctamente.",
                ...result,
            });
        } catch (error: any) {
            return this.sendError(reply, error, "No se pudo generar el dump.");
        }
    }

    async download(request: CustomRequest, reply: FastifyReply) {
        try {
            request?.rbac.assertAuthenticated();
            request?.rbac.assertPermission(RecoveryPermissions.Dump);

            const query = request.query as DownloadQuery;
            const archivePath = await this.service.resolveDownloadPath(query?.archivePath || "");
            const filename = basename(archivePath);

            return reply
                .header("Content-Type", "application/gzip")
                .header("Content-Disposition", `attachment; filename="${filename}"`)
                .send(createReadStream(archivePath));
        } catch (error: any) {
            return this.sendError(reply, error, "No se pudo descargar el dump.");
        }
    }

    async restoreUpload(request: CustomRequest, reply: FastifyReply) {
        try {
            request?.rbac.assertAuthenticated();
            request?.rbac.assertPermission(RecoveryPermissions.Restore);

            const uploadedFile = await (request as any).file({
                limits: {
                    fileSize: this.getMaxUploadBytes(),
                },
                throwFileSizeLimit: true,
            });

            if (!uploadedFile) {
                return reply.status(400).send({
                    success: false,
                    error: "RECOVERY_UPLOAD_REQUIRED",
                    message: "Debe subir un archivo de dump.",
                });
            }

            const masterPassword = this.getMultipartField(uploadedFile, "masterPassword");
            const drop = this.getMultipartField(uploadedFile, "drop") !== "false";
            const archivePath = await this.service.saveUploadedArchive(uploadedFile.file, uploadedFile.filename);
            const result = await this.service.restore(masterPassword, archivePath, drop);

            return reply.status(200).send({
                success: true,
                message: "Restore ejecutado correctamente.",
                ...result,
            });
        } catch (error: any) {
            return this.sendError(reply, error, "No se pudo ejecutar el restore.");
        }
    }

    private sendError(reply: FastifyReply, error: any, fallbackMessage: string) {
        return reply.status(error?.statusCode || 500).send({
            success: false,
            error: "RECOVERY_OPERATION_ERROR",
            message: error?.message || fallbackMessage,
        });
    }

    private getMultipartField(uploadedFile: any, fieldName: string): string {
        const field = uploadedFile?.fields?.[fieldName];
        return String(field?.value || "");
    }

    private getMaxUploadBytes(): number {
        const configuredLimit = Number(process.env.RECOVERY_MAX_UPLOAD_BYTES);

        if (Number.isFinite(configuredLimit) && configuredLimit > 0) {
            return configuredLimit;
        }

        return 1024 * 1024 * 1024;
    }
}

export default MongoRecoveryController;
export {MongoRecoveryController};
