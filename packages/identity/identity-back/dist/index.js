import GraphqlMerge from "./graphql/index.js";
import UserServiceFactory from "./factory/UserServiceFactory.js";
import RoleServiceFactory from "./factory/RoleServiceFactory.js";
import AuthServiceFactory from "./factory/AuthServiceFactory.js";
const graphqlMergeResult = await GraphqlMerge();
const identityTypeDefs = await graphqlMergeResult.typeDefs;
const identityResolvers = await graphqlMergeResult.resolvers;
const userService = UserServiceFactory();
const roleService = RoleServiceFactory();
const authService = AuthServiceFactory();
export { identityTypeDefs, identityResolvers, userService, roleService, authService };
/// <reference types="index.d.ts" />
