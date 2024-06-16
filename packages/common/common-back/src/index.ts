import GraphqlMerger from "./utils/GraphqlMerger";
import MongooseSoftDelete from "./utils/MongooseSoftDelete";
import GraphqlMerge from "./graphql/index.mjs"
import mongoose from "mongoose"
import {IPaginateFilter} from './interfaces/IPaginateFilter'
import {IPaginateResult} from './interfaces/IPaginateResult'
import {IValidationFieldError} from './interfaces/IValidationFieldError'
import {IResolvers, TypeSource} from "@graphql-tools/utils";
import UniqueError from "./errors/UniqueError";
import ValidationError from "./errors/ValidationError";
import ValidationFieldError from "./errors/ValidationFieldError";
import TransformMongooseValidationError from "./utils/TransformMongooseValidationError";
import TransformSqliteValidationError from "./utils/TransformSqliteValidationError";


const graphqlMergeResult = await GraphqlMerge()
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

