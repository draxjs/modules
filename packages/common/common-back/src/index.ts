import GraphqlMerger from "./utils/GraphqlMerger.js";
import MongooseSoftDelete from "./utils/MongooseSoftDelete.js";
import mongoose from "mongoose"
import type {IPaginateFilter} from './interfaces/IPaginateFilter'
import type {IPaginateResult} from './interfaces/IPaginateResult'
import type {IValidationFieldError} from './interfaces/IValidationFieldError'
import type {IResolvers, TypeSource} from "@graphql-tools/utils";
import UniqueError from "./errors/UniqueError.js";
import ValidationError from "./errors/ValidationError.js";
import ValidationFieldError from "./errors/ValidationFieldError.js";
import MongooseErrorToValidationError from "./errors/adapters/MongooseErrorToValidationError.js";
import MongoServerErrorToValidationError from "./errors/adapters/MongoServerErrorToValidationError.js";
import SqliteErrorToValidationError from "./errors/adapters/SqliteErrorToValidationError.js";
import ZodErrorToValidationError from "./errors/adapters/ZodErrorToValidationError.js";
import ValidationErrorToGraphQLError from "./errors/adapters/ValidationErrorToGraphQLError.js";
import commonGraphql  from "./graphql/index.js"
import DraxCache  from "./cache/DraxCache.js"
import DraxConfig  from "./config/DraxConfig.js"


const graphqlMergeResult = await commonGraphql()
const commonTypeDefs : TypeSource = await graphqlMergeResult.typeDefs;
const commonResolvers: IResolvers = await graphqlMergeResult.resolvers;

export {

    //Cache
    DraxCache,

    //Config
    DraxConfig,

    //Graphql
    GraphqlMerger,
    commonTypeDefs,
    commonResolvers,

    //Mongoose
    mongoose,
    MongooseSoftDelete,

    //Utils
    MongooseErrorToValidationError,
    MongoServerErrorToValidationError,
    SqliteErrorToValidationError,
    ZodErrorToValidationError,
    ValidationErrorToGraphQLError,

    //Errors
    UniqueError,
    ValidationError,
    ValidationFieldError,

}

export type{
    IPaginateFilter,
    IPaginateResult,
    IValidationFieldError
}

