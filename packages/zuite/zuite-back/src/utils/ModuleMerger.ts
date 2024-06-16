import { mergeTypeDefs, mergeResolvers  } from '@graphql-tools/merge'
import BaseMerge from '../modules/BaseModule/graphql/index.mjs'
import {commonResolvers, commonTypeDefs} from "@drax/common-back";
import {identityResolvers, identityTypeDefs} from "@drax/identity-back"


let baseMergeResult = await BaseMerge()
const baseTypeDefs = await baseMergeResult.typeDefs;
const baseResolvers = await baseMergeResult.resolvers;

export default async () => {
     const typeDefs =  mergeTypeDefs([baseTypeDefs, commonTypeDefs, identityTypeDefs]);
     const resolvers =  mergeResolvers([baseResolvers, commonResolvers, identityResolvers]);
     return {typeDefs, resolvers}
}

