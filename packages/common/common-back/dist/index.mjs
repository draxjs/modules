import GraphqlMerger from "./utils/GraphqlMerger.mjs";
import MongooseSoftDelete from "./utils/MongooseSoftDelete.mjs";
import GraphqlMerge from "./graphql/index.mjs";
import mongoose from "mongoose";
const graphqlMergeResult = await GraphqlMerge();
const commonTypeDefs = await graphqlMergeResult.typeDefs;
const commonResolvers = await graphqlMergeResult.resolvers;
export { GraphqlMerger, MongooseSoftDelete, commonTypeDefs, commonResolvers, mongoose };
