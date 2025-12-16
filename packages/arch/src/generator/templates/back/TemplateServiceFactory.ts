import {IEntitySchema} from "../../../interfaces/IEntitySchema";

export const TemplateServiceFactory = (entity: IEntitySchema) => `
import ${entity.name}MongoRepository from '../../repository/mongo/${entity.name}MongoRepository.js'
import ${entity.name}SqliteRepository from '../../repository/sqlite/${entity.name}SqliteRepository.js'
import type {I${entity.name}Repository} from "../../interfaces/I${entity.name}Repository";
import {${entity.name}Service} from '../../services/${entity.name}Service.js'
import {${entity.name}BaseSchema} from "../../schemas/${entity.name}Schema.js";
import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back";

class ${entity.name}ServiceFactory {
    private static service: ${entity.name}Service;

    public static get instance(): ${entity.name}Service {
        if (!${entity.name}ServiceFactory.service) {
            
            let repository: I${entity.name}Repository
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new ${entity.name}MongoRepository()
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile)
                    repository = new ${entity.name}SqliteRepository(dbFile, false)
                    repository.build()
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }
            
            const schema = ${entity.name}BaseSchema;
            ${entity.name}ServiceFactory.service = new ${entity.name}Service(repository, schema);
        }
        return ${entity.name}ServiceFactory.service;
    }
}

export default ${entity.name}ServiceFactory
export {
    ${entity.name}ServiceFactory
}

`
