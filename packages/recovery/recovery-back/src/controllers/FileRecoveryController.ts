import {createReadStream} from "node:fs";
import {basename} from "node:path";
import type {FastifyReply} from "fastify";
import type {CustomRequest} from "@drax/crud-back";
import RecoveryPermissions from "../permissions/RecoveryPermissions.js";
import FileRecoveryService from "../services/FileRecoveryService.js";

type BackupBody = {
    masterPassword?: string;
};

type DownloadQuery = {
    archivePath?: string;
};

class FileRecoveryController {
    private readonly service = new FileRecoveryService();

    async backup(request: CustomRequest, reply: FastifyReply) {
        try {
            request?.rbac.assertAuthenticated();
            request?.rbac.assertPermission(RecoveryPermissions.FileBackup);

            const body = request.body as BackupBody;
            const result = await this.service.backup(body?.masterPassword || "");

            return reply.status(200).send({
                success: true,
                message: "Backup de archivos generado correctamente.",
                ...result,
            });
        } catch (error: any) {
            return this.sendError(request, reply, error, "No se pudo generar el backup de archivos.", "files.backup");
        }
    }

    async download(request: CustomRequest, reply: FastifyReply) {
        try {
            request?.rbac.assertAuthenticated();
            request?.rbac.assertPermission(RecoveryPermissions.FileBackup);

            const query = request.query as DownloadQuery;
            const archivePath = await this.service.resolveDownloadPath(query?.archivePath || "");
            const filename = basename(archivePath);

            return reply
                .header("Content-Type", "application/gzip")
                .header("Content-Disposition", `attachment; filename="${filename}"`)
                .send(createReadStream(archivePath));
        } catch (error: any) {
            return this.sendError(request, reply, error, "No se pudo descargar el backup de archivos.", "files.download");
        }
    }

    async restoreUpload(request: CustomRequest, reply: FastifyReply) {
        try {
            request?.rbac.assertAuthenticated();
            request?.rbac.assertPermission(RecoveryPermissions.FileRestore);

            const uploadedFile = await (request as any).file({
                limits: {
                    fileSize: this.getMaxUploadBytes(),
                },
                throwFileSizeLimit: true,
            });

            if (!uploadedFile) {
                return reply.status(400).send({
                    success: false,
                    error: "FILE_RECOVERY_UPLOAD_REQUIRED",
                    message: "Debe subir un archivo de backup.",
                });
            }

            const masterPassword = this.getMultipartField(uploadedFile, "masterPassword");
            const cleanTarget = this.getMultipartField(uploadedFile, "cleanTarget") === "true";
            const archivePath = await this.service.saveUploadedArchive(uploadedFile.file, uploadedFile.filename);
            const result = await this.service.restore(masterPassword, archivePath, cleanTarget);

            return reply.status(200).send({
                success: true,
                message: "Restore de archivos ejecutado correctamente.",
                ...result,
            });
        } catch (error: any) {
            return this.sendError(request, reply, error, "No se pudo ejecutar el restore de archivos.", "files.restoreUpload");
        }
    }

    private sendError(request: CustomRequest, reply: FastifyReply, error: any, fallbackMessage: string, operation: string) {
        const statusCode = error?.statusCode || 500;
        const message = error?.message || fallbackMessage;
        const errorCode = error?.code || "FILE_RECOVERY_OPERATION_ERROR";
        const details = error?.details;

        request.log?.error({
            err: error,
            operation,
            statusCode,
            errorCode,
            message,
            details,
        }, "recovery file operation failed");

        return reply.status(statusCode).send({
            success: false,
            error: errorCode,
            message,
            details,
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

export default FileRecoveryController;
export {FileRecoveryController};
