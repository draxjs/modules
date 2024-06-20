import GraphqlMerge from "./graphql/index.js"
import UserServiceFactory from "./factory/UserServiceFactory.js";
import RoleServiceFactory from "./factory/RoleServiceFactory.js";
import RoleService from "./services/RoleService.js";
import UserService from "./services/UserService.js";
import Rbac from "./rbac/Rbac.js";
import {UserRoutes} from "./routes/UserRoutes.js";
import {RoleRoutes} from "./routes/RoleRoutes.js";
import AuthUtils from "./utils/AuthUtils.js";
import {jwtMiddleware} from "./middleware/jwtMiddleware.js";
import {rbacMiddleware} from "./middleware/rbacMiddleware.js";

import IdentityPermissions from "./permissions/IdentityPermissions.js";
import UnauthorizedError from "./errors/UnauthorizedError.js";
import BadCredentialsError from "./errors/BadCredentialsError.js";

import type {IJwtUser} from "./interfaces/IJwtUser";
import type {IRole, IRoleBase} from "./interfaces/IRole";
import type {IUser} from "./interfaces/IUser";
import type {IUserRepository} from "./interfaces/IUserRepository";
import type {IRoleRepository} from "./interfaces/IRoleRepository";

const graphqlMergeResult = await GraphqlMerge()
const identityTypeDefs = await graphqlMergeResult.typeDefs;
const identityResolvers = await graphqlMergeResult.resolvers;

export type {
    IJwtUser,
    IRole,
    IRoleBase,
    IRoleRepository,
    IUser,
    IUserRepository
}

export {
    //Service
    UserService,
    RoleService,
    Rbac,

    //Factories
    UserServiceFactory,
    RoleServiceFactory,

    //GQL
    identityTypeDefs,
    identityResolvers,

    //API REST
    UserRoutes,
    RoleRoutes,

    AuthUtils,

    //API MIDDLEWARE
    jwtMiddleware,
    rbacMiddleware,

    //Permissions
    IdentityPermissions,

    //Errors
    UnauthorizedError,
    BadCredentialsError
}


/// <reference types="index.d.ts" />
