import MongoRecoveryController from "../controllers/MongoRecoveryController.js";
import FileRecoveryController from "../controllers/FileRecoveryController.js";

const RECOVERY_TIMEOUT_MS = 60 * 60 * 1000;

async function RecoveryFastifyRoutes(fastify, options) {
    const mongoController = new MongoRecoveryController();
    const fileController = new FileRecoveryController();

    fastify.post(
        "/api/recovery/mongo/dump",
        {
            handlerTimeout: RECOVERY_TIMEOUT_MS,
            schema: {
                tags: ["recovery"],
                summary: "Generate a MongoDB dump",
                body: {
                    type: "object",
                    required: ["masterPassword"],
                    properties: {
                        masterPassword: {type: "string"},
                    },
                },
            },
        },
        (req, rep) => mongoController.dump(req as any, rep)
    );

    fastify.get(
        "/api/recovery/mongo/download",
        {
            handlerTimeout: RECOVERY_TIMEOUT_MS,
            schema: {
                tags: ["recovery"],
                summary: "Download a MongoDB dump",
                querystring: {
                    type: "object",
                    required: ["archivePath"],
                    properties: {
                        archivePath: {type: "string"},
                    },
                },
            },
        },
        (req, rep) => mongoController.download(req as any, rep)
    );

    fastify.post(
        "/api/recovery/mongo/restore-upload",
        {
            handlerTimeout: RECOVERY_TIMEOUT_MS,
            schema: {
                tags: ["recovery"],
                summary: "Upload and restore a MongoDB dump",
            },
        },
        (req, rep) => mongoController.restoreUpload(req as any, rep)
    );

    fastify.post(
        "/api/recovery/files/backup",
        {
            handlerTimeout: RECOVERY_TIMEOUT_MS,
            schema: {
                tags: ["recovery"],
                summary: "Generate a DRAX_FILE_DIR backup",
                body: {
                    type: "object",
                    required: ["masterPassword"],
                    properties: {
                        masterPassword: {type: "string"},
                    },
                },
            },
        },
        (req, rep) => fileController.backup(req as any, rep)
    );

    fastify.get(
        "/api/recovery/files/download",
        {
            handlerTimeout: RECOVERY_TIMEOUT_MS,
            schema: {
                tags: ["recovery"],
                summary: "Download a DRAX_FILE_DIR backup",
                querystring: {
                    type: "object",
                    required: ["archivePath"],
                    properties: {
                        archivePath: {type: "string"},
                    },
                },
            },
        },
        (req, rep) => fileController.download(req as any, rep)
    );

    fastify.post(
        "/api/recovery/files/restore-upload",
        {
            handlerTimeout: RECOVERY_TIMEOUT_MS,
            schema: {
                tags: ["recovery"],
                summary: "Upload and restore a DRAX_FILE_DIR backup",
            },
        },
        (req, rep) => fileController.restoreUpload(req as any, rep)
    );
}

export default RecoveryFastifyRoutes;
export {RecoveryFastifyRoutes};
