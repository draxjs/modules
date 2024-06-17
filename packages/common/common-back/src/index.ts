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
import TransformMongooseValidationError from "./utils/TransformMongooseValidationError.js";
import TransformSqliteValidationError from "./utils/TransformSqliteValidationError.js";
import TransformZodValidationError from "./utils/TransformZodValidationError.js";
import TransformValidationGraphqlError from "./utils/TransformValidationGraphqlError.js";
import commonGraphql  from "./graphql/index.js"

const graphqlMergeResult = await commonGraphql()
const commonTypeDefs : TypeSource = await graphqlMergeResult.typeDefs;
const commonResolvers: IResolvers = await graphqlMergeResult.resolvers;

export {
    //Graphql
    GraphqlMerger,
    commonTypeDefs,
    commonResolvers,

    //Mongoose
    mongoose,
    MongooseSoftDelete,

    //Utils
    TransformMongooseValidationError,
    TransformSqliteValidationError,
    TransformZodValidationError,
    TransformValidationGraphqlError,

    //Errors
    UniqueError,
    ValidationError,
    ValidationFieldError,

}

export type{
    IPaginateFilter,
    IPaginateResult,
    IValidationFieldError,
}

