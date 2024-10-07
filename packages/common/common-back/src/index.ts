import type {IResolvers, TypeSource} from "@graphql-tools/utils";
import type {IValidationFieldError} from './interfaces/IValidationFieldError'
import type {IDraxConfig} from './interfaces/IDraxConfig'
import type {IUploadFile, IUploadFileResult, IUploadFileOptions} from './interfaces/IUploadFile'


//Mongoose
import MongooseSoftDelete from "./mongoose/MongooseSoftDelete.js";
import MongooseConector from "./mongoose/MongooseConector.js";
import MongooseQueryFilter from "./mongoose/MongooseQueryFilter.js";
import MongooseSort from "./mongoose/MongooseSort.js";
import mongoose from "mongoose"

//SQL
import SqlQueryFilter from "./sql/SqlQueryFilter.js";
import SqlSort from "./sql/SqlSort.js";

import {SqliteTableBuilder} from "./sqlite/SqliteTableBuilder.js";
import type {SqliteTableField} from "./sqlite/SqliteTableBuilder";

//Errors
import UniqueError from "./errors/UniqueError.js";
import ValidationError from "./errors/ValidationError.js";
import ValidationFieldError from "./errors/ValidationFieldError.js";
import {UploadFileError} from "./errors/UploadFileError.js";

import MongooseErrorToValidationError from "./errors/adapters/MongooseErrorToValidationError.js";
import MongoServerErrorToValidationError from "./errors/adapters/MongoServerErrorToValidationError.js";
import SqliteErrorToValidationError from "./errors/adapters/SqliteErrorToValidationError.js";
import ZodErrorToValidationError from "./errors/adapters/ZodErrorToValidationError.js";
import ValidationErrorToGraphQLError from "./errors/adapters/ValidationErrorToGraphQLError.js";
import commonGraphql  from "./graphql/index.js"

//Config
import DraxCache  from "./cache/DraxCache.js"
import DraxConfig  from "./config/DraxConfig.js"
import CommonConfig  from "./config/CommonConfig.js"
import LoadCommonConfigFromEnv  from "./setup/LoadCommonConfigFromEnv.js"

//Constants
import {COMMON} from "./constants/CommonConstants.js"

//Utils
import {WorkerHandler} from "./utils/WorkerHandler.js";
import {createDirIfNotExist} from "./utils/CreateDirIfNotExist.js";

//Store
import {StoreManager} from "./store/StoreManager.js";
import {StreamFileStore} from "./store/StreamFileStore.js";
import {StreamSizeValidator} from "./store/StreamSizeValidator.js";

//GQL
import GraphqlMerger from "./utils/GraphqlMerger.js";
const graphqlMergeResult = await commonGraphql()
const commonTypeDefs : TypeSource = await graphqlMergeResult.typeDefs;
const commonResolvers: IResolvers = await graphqlMergeResult.resolvers;



export {

    //Utils
    createDirIfNotExist,
    WorkerHandler,

    //Constants
    COMMON,

    //Cache
    DraxCache,

    //Config
    DraxConfig,
    CommonConfig,
    LoadCommonConfigFromEnv,

    //Graphql
    GraphqlMerger,
    commonTypeDefs,
    commonResolvers,

    //Mongoose
    mongoose,
    MongooseSoftDelete,
    MongooseConector,
    MongooseQueryFilter,
    MongooseSort,

    //SQL
    SqlQueryFilter,
    SqlSort,

    //Utils
    StoreManager,
    StreamFileStore,
    StreamSizeValidator,
    SqliteTableBuilder,

    //Adapters
    MongooseErrorToValidationError,
    MongoServerErrorToValidationError,
    SqliteErrorToValidationError,
    ZodErrorToValidationError,
    ValidationErrorToGraphQLError,

    //Errors
    UniqueError,
    ValidationError,
    ValidationFieldError,
    UploadFileError,

}

export type{

    IValidationFieldError,
    IDraxConfig,

    IUploadFile,
    IUploadFileResult,
    IUploadFileOptions,

    SqliteTableField
}

