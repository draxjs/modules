import {IEntitySchema} from "../../../interfaces/IEntitySchema";

export const TemplateServiceFactory = (entity: IEntitySchema) => `
import ${entity.name}Repository from '../../repository/${entity.name}Repository.js'
import {${entity.name}Service} from '../../services/${entity.name}Service.js'
import {${entity.name}BaseSchema} from "../../schemas/${entity.name}Schema.js";

class ${entity.name}ServiceFactory {
    private static service: ${entity.name}Service;

    public static get instance(): ${entity.name}Service {
        if (!${entity.name}ServiceFactory.service) {
            const repository = new ${entity.name}Repository();
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
