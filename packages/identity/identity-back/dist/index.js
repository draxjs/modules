import GraphqlMerge from "./graphql/index.js";
import UserServiceFactory from "./factory/UserServiceFactory.js";
import RoleServiceFactory from "./factory/RoleServiceFactory.js";
import { authRoutes } from "./routes/authRoutes.js";
import AuthUtils from "./utils/AuthUtils.js";
import { jwtMiddleware } from "./middleware/jwtMiddleware.js";
const graphqlMergeResult = await GraphqlMerge();
const identityTypeDefs = await graphqlMergeResult.typeDefs;
const identityResolvers = await graphqlMergeResult.resolvers;
const userService = UserServiceFactory();
const roleService = RoleServiceFactory();
export { 
//Service
userService, roleService, 
//GQL
identityTypeDefs, identityResolvers, 
//API REST
authRoutes, AuthUtils, 
//API MIDDLEWARE
jwtMiddleware, };
/// <reference types="index.d.ts" />
