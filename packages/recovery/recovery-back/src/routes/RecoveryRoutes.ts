import RecoveryController from "../controllers/RecoveryController.js";
import FileRecoveryController from "../controllers/FileRecoveryController.js";

async function RecoveryFastifyRoutes(fastify, options) {
    const controller = new RecoveryController();
    const fileController = new FileRecoveryController();

    fastify.post(
        "/api/recovery/dump",
        {
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
        (req, rep) => controller.dump(req as any, rep)
    );

    fastify.post(
        "/api/recovery/restore",
        {
            schema: {
                tags: ["recovery"],
                summary: "Restore a MongoDB dump",
                body: {
                    type: "object",
                    required: ["masterPassword", "archivePath"],
                    properties: {
                        masterPassword: {type: "string"},
                        archivePath: {type: "string"},
                        drop: {type: "boolean"},
                    },
                },
            },
        },
        (req, rep) => controller.restore(req as any, rep)
    );

    fastify.get(
        "/api/recovery/download",
        {
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
        (req, rep) => controller.download(req as any, rep)
    );

    fastify.post(
        "/api/recovery/restore-upload",
        {
            schema: {
                tags: ["recovery"],
                summary: "Upload and restore a MongoDB dump",
            },
        },
        (req, rep) => controller.restoreUpload(req as any, rep)
    );

    fastify.post(
        "/api/recovery/files/backup",
        {
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

    fastify.post(
        "/api/recovery/files/restore",
        {
            schema: {
                tags: ["recovery"],
                summary: "Restore a DRAX_FILE_DIR backup",
                body: {
                    type: "object",
                    required: ["masterPassword", "archivePath"],
                    properties: {
                        masterPassword: {type: "string"},
                        archivePath: {type: "string"},
                        cleanTarget: {type: "boolean"},
                    },
                },
            },
        },
        (req, rep) => fileController.restore(req as any, rep)
    );

    fastify.get(
        "/api/recovery/files/download",
        {
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
