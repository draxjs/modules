import GraphqlMerge from "./graphql/index.js";
import UserServiceFactory from "./factory/UserServiceFactory.js";
import RoleServiceFactory from "./factory/RoleServiceFactory.js";
import AuthServiceFactory from "./factory/AuthServiceFactory.js";
import { authRoutes } from "./routes/authRoutes.js";
const graphqlMergeResult = await GraphqlMerge();
const identityTypeDefs = await graphqlMergeResult.typeDefs;
const identityResolvers = await graphqlMergeResult.resolvers;
const userService = UserServiceFactory();
const roleService = RoleServiceFactory();
const authService = AuthServiceFactory();
export { 
//Service
userService, roleService, authService, 
//GQL
identityTypeDefs, identityResolvers, 
//API REST
authRoutes };
/// <reference types="index.d.ts" />
