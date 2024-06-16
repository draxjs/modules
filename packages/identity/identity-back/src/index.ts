import GraphqlMerge from "./graphql/index.js"
import UserServiceFactory from "./factory/UserServiceFactory.js";
import RoleServiceFactory from "./factory/RoleServiceFactory.js";
import AuthServiceFactory from "./factory/AuthServiceFactory.js";
import {authRoutes} from "./routes/authRoutes.js";
import AuthUtils from "./utils/AuthUtils.js";
import {jwtMiddleware} from "./middleware/jwtMiddleware.js";

import type {IJwtUser} from "./interfaces/IJwtUser.js";

const graphqlMergeResult = await GraphqlMerge()
const identityTypeDefs = await graphqlMergeResult.typeDefs;
const identityResolvers = await graphqlMergeResult.resolvers;

const userService = UserServiceFactory()
const roleService = RoleServiceFactory()

const authService = AuthServiceFactory()

export type {IJwtUser}

export {
    //Service
    userService,
    roleService,
    authService,

    //GQL
    identityTypeDefs,
    identityResolvers,

    //API REST
    authRoutes,

    AuthUtils,

    //API MIDDLEWARE
    jwtMiddleware,
}


/// <reference types="index.d.ts" />
