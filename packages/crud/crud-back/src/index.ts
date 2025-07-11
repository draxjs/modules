//CRUD
import AbstractMongoRepository from "./repository/AbstractMongoRepository.js";
import AbstractSqliteRepository from "./repository/AbstractSqliteRepository.js";
import AbstractService from "./services/AbstractService.js";
import AbstractFastifyController from "./controllers/AbstractFastifyController.js";
import type {CustomRequest} from "./controllers/AbstractFastifyController.js";

//schemas
import {IdParamSchema} from "./schemas/IdParamSchema.js"
import {DeleteBodyResponseSchema} from "./schemas/DeleteBodyResponseSchema.js"
import {PaginateBodyResponseSchema, PaginateQuerySchema} from "./schemas/PaginateSchema.js"
import {FindQuerySchema} from "./schemas/FindSchema.js"
import {SearchQuerySchema} from "./schemas/SearchSchema.js"
import {FindByParamSchema} from "./schemas/FindBySchema.js"
import {ExportBodyResponseSchema} from "./schemas/ExportBodyResponseSchema.js"
import {ErrorBodyResponseSchema, ValidationErrorBodyResponseSchema} from "./schemas/ErrorBodyResponseSchema.js"
import {CrudSchemaBuilder} from "./builders/CrudSchemaBuilder.js";

export type {
    CustomRequest
}

export {

    //CRUD
    AbstractMongoRepository,
    AbstractSqliteRepository,
    AbstractService,
    AbstractFastifyController,


    //Schemas
    IdParamSchema,
    DeleteBodyResponseSchema,
    PaginateBodyResponseSchema,
    PaginateQuerySchema,
    FindQuerySchema,
    SearchQuerySchema,
    FindByParamSchema,
    ErrorBodyResponseSchema,
    ValidationErrorBodyResponseSchema,
    ExportBodyResponseSchema,

    //Builder
    CrudSchemaBuilder,


}
