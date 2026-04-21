import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back";
import CrudSavedQueryMongoRepository from "../../repository/mongo/CrudSavedQueryMongoRepository.js";
import CrudSavedQuerySqliteRepository from "../../repository/sqlite/CrudSavedQuerySqliteRepository.js";
import {CrudSavedQueryService} from "../../services/CrudSavedQueryService.js";
import {CrudSavedQueryBaseSchema, CrudSavedQuerySchema} from "../../schemas/CrudSavedQuerySchema.js";
import type {ICrudSavedQueryRepository} from "../../interfaces/ICrudSavedQueryRepository";

class CrudSavedQueryServiceFactory {
    private static service: CrudSavedQueryService;

    public static get instance(): CrudSavedQueryService {
        if (!CrudSavedQueryServiceFactory.service) {
            let repository: ICrudSavedQueryRepository;

            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new CrudSavedQueryMongoRepository();
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    repository = new CrudSavedQuerySqliteRepository(
                        DraxConfig.getOrLoad(CommonConfig.SqliteDbFile),
                        false
                    );
                    repository.build();
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }

            CrudSavedQueryServiceFactory.service = new CrudSavedQueryService(
                repository,
                CrudSavedQueryBaseSchema,
                CrudSavedQuerySchema
            );
        }
        return CrudSavedQueryServiceFactory.service;
    }
}

export default CrudSavedQueryServiceFactory;
export {CrudSavedQueryServiceFactory};
