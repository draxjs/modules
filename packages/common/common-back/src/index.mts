import GraphqlMerger from "./utils/GraphqlMerger.mjs";
import MongooseSoftDelete from "./utils/MongooseSoftDelete.mjs";
import GraphqlMerge from "./graphql/index.mjs"
import mongoose from "mongoose"
import {IPaginateFilter} from './interfaces/IPaginateFilter.mjs'
import {IResolvers, TypeSource} from "@graphql-tools/utils";

const graphqlMergeResult = await GraphqlMerge()
const commonTypeDefs : TypeSource = await graphqlMergeResult.typeDefs;
const commonResolvers: IResolvers = await graphqlMergeResult.resolvers;

export {
    GraphqlMerger,
    MongooseSoftDelete,
    commonTypeDefs,
    commonResolvers,
    mongoose,

    IPaginateFilter
}

