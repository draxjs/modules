//CRUD
import AbstractMongoRepository from "./repository/AbstractMongoRepository.js";
import AbstractSqliteRepository from "./repository/AbstractSqliteRepository.js";
import AbstractService from "./services/AbstractService.js";
import AbstractFastifyController from "./controllers/AbstractFastifyController.js";
import type {CustomRequest} from "./controllers/AbstractFastifyController.js";
import {CrudEventEmitter} from "./events/CrudEventEmitter.js";

//schemas
import {IdParamSchema} from "./schemas/IdParamSchema.js"
import {DeleteBodyResponseSchema} from "./schemas/DeleteBodyResponseSchema.js"
import {PaginateBodyResponseSchema, PaginateQuerySchema} from "./schemas/PaginateSchema.js"
import {FindQuerySchema} from "./schemas/FindSchema.js"
import {SearchQuerySchema} from "./schemas/SearchSchema.js"
import {FindByParamSchema} from "./schemas/FindBySchema.js"
import {GroupByQuerySchema} from "./schemas/GroupBySchema.js"
import {ExportBodyResponseSchema} from "./schemas/ExportBodyResponseSchema.js"
import {ErrorBodyResponseSchema, ValidationErrorBodyResponseSchema} from "./schemas/ErrorBodyResponseSchema.js"
import {CrudSchemaBuilder} from "./builders/CrudSchemaBuilder.js";

import CrudSavedQueryFastifyRoutes from "./crud-saved-query/routes/CrudSavedQueryRoutes.js";
import {CrudSavedQueryController} from "./crud-saved-query/controllers/CrudSavedQueryController.js";
import {CrudSavedQueryService} from "./crud-saved-query/services/CrudSavedQueryService.js";
import {CrudSavedQueryServiceFactory} from "./crud-saved-query/factory/services/CrudSavedQueryServiceFactory.js";
import CrudSavedQueryMongoRepository from "./crud-saved-query/repository/mongo/CrudSavedQueryMongoRepository.js";
import CrudSavedQuerySqliteRepository from "./crud-saved-query/repository/sqlite/CrudSavedQuerySqliteRepository.js";
import CrudSavedQueryPermissions from "./crud-saved-query/permissions/CrudSavedQueryPermissions.js";
import {CrudSavedQueryModel, CrudSavedQuerySchema} from "./crud-saved-query/models/CrudSavedQueryModel.js";

export type {
    CustomRequest
}

export {

    //CRUD
    AbstractMongoRepository,
    AbstractSqliteRepository,
    AbstractService,
    AbstractFastifyController,

    //EVENTs
    CrudEventEmitter,


    //Schemas
    IdParamSchema,
    DeleteBodyResponseSchema,
    PaginateBodyResponseSchema,
    PaginateQuerySchema,
    FindQuerySchema,
    GroupByQuerySchema,
    SearchQuerySchema,
    FindByParamSchema,
    ErrorBodyResponseSchema,
    ValidationErrorBodyResponseSchema,
    ExportBodyResponseSchema,

    //Builder
    CrudSchemaBuilder,

    //Crud saved queries
    CrudSavedQueryFastifyRoutes,
    CrudSavedQueryController,
    CrudSavedQueryService,
    CrudSavedQueryServiceFactory,
    CrudSavedQueryMongoRepository,
    CrudSavedQuerySqliteRepository,
    CrudSavedQueryPermissions,
    CrudSavedQueryModel,
    CrudSavedQuerySchema,

}
