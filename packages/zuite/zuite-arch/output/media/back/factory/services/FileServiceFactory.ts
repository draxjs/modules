
import FileMongoRepository from '../../repository/mongo/FileMongoRepository.js'
import FileSqliteRepository from '../../repository/sqlite/FileSqliteRepository.js'
import type {IFileRepository} from "../../interfaces/IFileRepository";
import {FileService} from '../../services/FileService.js'
import {FileBaseSchema, FileSchema} from "../../schemas/FileSchema.js";
import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back";

class FileServiceFactory {
    private static service: FileService;

    public static get instance(): FileService {
        if (!FileServiceFactory.service) {
            
            let repository: IFileRepository
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new FileMongoRepository()
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile)
                    repository = new FileSqliteRepository(dbFile, false)
                    repository.build()
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }
            
            const baseSchema = FileBaseSchema;
            const fullSchema = FileSchema;
            FileServiceFactory.service = new FileService(repository, baseSchema, fullSchema);
        }
        return FileServiceFactory.service;
    }
}

export default FileServiceFactory
export {
    FileServiceFactory
}

