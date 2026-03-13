import { MediaRoutes } from "./routes/MediaRoutes.js";
import { MediaPermissions } from "./permissions/MediaPermissions.js";
import { FileRoutes } from "./routes/FileRoutes.js";
import { FilePermissions } from "./permissions/FilePermissions.js";
import FileSchema from "./schemas/FileSchema.js";
import FileModel from "./models/FileModel.js";
import FileMongoRepository from "./repository/mongo/FileMongoRepository.js";
import FileSqliteRepository from "./repository/sqlite/FileSqliteRepository.js";
import FileService from "./services/FileService.js";
import FileServiceFactory from "./factory/services/FileServiceFactory.js";
import FileController from "./controllers/FileController.js";
import type { IFile, IFileBase } from "./interfaces/IFile";
import type { IFileRepository } from "./interfaces/IFileRepository";

export type {
    IFile,
    IFileBase,
    IFileRepository
}

export {
    //Routes
    MediaRoutes,
    FileRoutes,

    //Permissions
    MediaPermissions,
    FilePermissions,

    //File
    FileSchema,
    FileModel,
    FileMongoRepository,
    FileSqliteRepository,
    FileService,
    FileServiceFactory,
    FileController
}
