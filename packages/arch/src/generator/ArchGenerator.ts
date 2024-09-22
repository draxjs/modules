import type {IEntitySchema} from "../interfaces/IEntitySchema";
import {TemplateService} from "./templates/back/TemplateService";
import {writeFile} from "./helpers/writeFile";
import {TemplateMongoRepository} from "./templates/back/TemplateMongoRepository";
import {TemplatePermissions} from "./templates/back/TemplatePermissions";
import {TemplateMongoModel} from "./templates/back/TemplateMongoModel";
import {TemplateEntityInterface} from "./templates/share/TemplateEntityInterface";
import {TemplateEntityRepositoryInterface} from "./templates/back/TemplateEntityRepositoryInterface";
import {TemplateSchema} from "./templates/back/TemplateSchema";
import {TemplateServiceFactory} from "./templates/back/TemplateServiceFactory";
import {TemplateFastifyController} from "./templates/back/TemplateFastifyController";
import {TemplateRoutes} from "./templates/back/TemplateRoutes";
import {TemplateRestProvider} from "./templates/front/TemplateRestProvider";
import {TemplateEntityCrud} from "./templates/front/TemplateEntityCrud";
import {TemplateCrudPage} from "./templates/front/TemplateCrudPage";
import {TemplateCrudRoute} from "./templates/front/TemplateCrudRoute";
import {Templatei18n} from "./templates/front/Templatei18n";

class ArchGenerator{

    entitiesSchema: IEntitySchema[];
    outputPath: string = './output';

    constructor(entitiesSchema: IEntitySchema[], outputPath: string = './output') {
        this.entitiesSchema = entitiesSchema;
        this.outputPath = outputPath;
    }

    async build() {

        for(const entity of this.entitiesSchema){
            //SHARE
            await this.interfaceEntity(entity)

            //BACK
            await this.interfaceEntityRepository(entity)
            await this.entitySchema(entity)
            await this.mongoModel(entity)
            await this.permissions(entity)
            await this.mongoRepository(entity)
            await this.service(entity)
            await this.serviceFactory(entity)
            await this.fastifyController(entity)
            await this.routes(entity)

            //FRONT
            await this.restProvider(entity)
            await this.entityCrud(entity)
            await this.crudPage(entity)
            await this.crudRoute(entity)
            await this.i18n(entity)
        }


    }

    async writeToFile(dirPath:string, fileName:string, content:string) {
        await writeFile(dirPath, fileName, content)
    }

    async i18n(entity: IEntitySchema){
        const content = Templatei18n(entity)
        const path = this.outputPath + '/'+ entity.module + '/front/i18n'
        const fileName = `${entity.name}-i18n.ts`
        await this.writeToFile(path, fileName, content)
    }

    async restProvider(entity: IEntitySchema){
        const content = TemplateRestProvider(entity)
        const path = this.outputPath + '/'+ entity.module + '/front/providers'
        const fileName = `${entity.name}Provider.ts`
        await this.writeToFile(path, fileName, content)
    }

    async entityCrud(entity: IEntitySchema){
        const content = TemplateEntityCrud(entity)
        const path = this.outputPath + '/'+ entity.module + '/front/cruds'
        const fileName = `${entity.name}Crud.ts`
        await this.writeToFile(path, fileName, content)
    }

    async crudPage(entity: IEntitySchema){
        const content = TemplateCrudPage(entity)
        const path = this.outputPath + '/'+ entity.module + '/front/pages'
        const fileName = `${entity.name}CrudPage.vue`
        await this.writeToFile(path, fileName, content)
    }

    async crudRoute(entity: IEntitySchema){
        const content = TemplateCrudRoute(entity)
        const path = this.outputPath + '/'+ entity.module + '/front/routes'
        const fileName = `${entity.name}CrudRoute.ts`
        await this.writeToFile(path, fileName, content)
    }

    async fastifyController(entity: IEntitySchema){
        const content = TemplateFastifyController(entity)
        const path = this.outputPath + '/'+ entity.module + '/back/controllers'
        const fileName = `${entity.name}Controller.ts`
        await this.writeToFile(path, fileName, content)
    }

    async routes(entity: IEntitySchema){
        const content = TemplateRoutes(entity)
        const path = this.outputPath + '/'+ entity.module + '/back/routes'
        const fileName = `${entity.name}Routes.ts`
        await this.writeToFile(path, fileName, content)
    }

    async service(entity: IEntitySchema){
        const content = TemplateService(entity)
        const path = this.outputPath + '/'+ entity.module + '/back/services'
        const fileName = `${entity.name}Service.ts`
        await this.writeToFile(path, fileName, content)
    }

    async serviceFactory(entity: IEntitySchema){
        const content = TemplateServiceFactory(entity)
        const path = this.outputPath + '/'+ entity.module + '/back/factory'
        const fileName = `${entity.name}ServiceFactory.ts`
        await this.writeToFile(path, fileName, content)
    }


    async mongoRepository(entity: IEntitySchema){
        const content = TemplateMongoRepository(entity)
        const path = this.outputPath + '/'+ entity.module + '/back/repository'
        const fileName = `${entity.name}Repository.ts`
        await this.writeToFile(path, fileName, content)
    }

    async mongoModel(entity: IEntitySchema){
        const content = TemplateMongoModel(entity)
        const path = this.outputPath + '/'+ entity.module + '/back/models'
        const fileName = `${entity.name}Model.ts`
        await this.writeToFile(path, fileName, content)
    }

    async entitySchema(entity: IEntitySchema){
        const content = TemplateSchema(entity)
        const path = this.outputPath + '/'+ entity.module + '/back/schemas'
        const fileName = `${entity.name}Schema.ts`
        await this.writeToFile(path, fileName, content)
    }


    async interfaceEntity(entity: IEntitySchema){
        const content = TemplateEntityInterface(entity)
        const fileName = `I${entity.name}.ts`
        const backPath = this.outputPath + '/'+ entity.module + '/back/interfaces'
        await this.writeToFile(backPath, fileName, content)
        const frontPath = this.outputPath + '/'+ entity.module + '/front/interfaces'
        await this.writeToFile(frontPath, fileName, content)
    }

    async interfaceEntityRepository(entity: IEntitySchema){
        const content = TemplateEntityRepositoryInterface(entity)
        const path = this.outputPath + '/'+ entity.module + '/back/interfaces'
        const fileName = `I${entity.name}Repository.ts`
        await this.writeToFile(path, fileName, content)
    }

    async permissions(entity: IEntitySchema){
        const content = TemplatePermissions(entity)
        const path = this.outputPath + '/'+ entity.module + '/back/permissions'
        const fileName = `${entity.name}Permissions.ts`
        await this.writeToFile(path, fileName, content)
    }

}

export default ArchGenerator
export {ArchGenerator}
