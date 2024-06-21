import GraphqlMerge from "./graphql/index.js"
import UserServiceFactory from "./factory/UserServiceFactory.js";
import RoleServiceFactory from "./factory/RoleServiceFactory.js";
import RoleService from "./services/RoleService.js";
import UserService from "./services/UserService.js";
import PermissionService from "./services/PermissionService.js";
import Rbac from "./rbac/Rbac.js";
import {UserRoutes} from "./routes/UserRoutes.js";
import {RoleRoutes} from "./routes/RoleRoutes.js";
import AuthUtils from "./utils/AuthUtils.js";
import {jwtMiddleware} from "./middleware/jwtMiddleware.js";
import {rbacMiddleware} from "./middleware/rbacMiddleware.js";

import IdentityPermissions from "./permissions/IdentityPermissions.js";
import IdentityConfig from "./config/IdentityConfig.js";
import UnauthorizedError from "./errors/UnauthorizedError.js";
import BadCredentialsError from "./errors/BadCredentialsError.js";

import CreateUserIfNotExist from "./setup/CreateUserIfNotExist.js";
import CreateOrUpdateRole from "./setup/CreateOrUpdateRole.js";
import LoadPermissions from "./setup/LoadPermissions.js";
import LoadConfigFromEnv from "./setup/LoadConfigFromEnv.js";
import RecoveryUserPassword from "./setup/RecoveryUserPassword.js";

import type {IJwtUser} from "./interfaces/IJwtUser";
import type {IRole, IRoleBase} from "./interfaces/IRole";
import type {IUser, IUserCreate, IUserUpdate} from "./interfaces/IUser";
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
    IUser, IUserCreate, IUserUpdate,
    IUserRepository
}

export {
    //Service
    UserService,
    RoleService,
    PermissionService,
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

    //Config
    IdentityConfig,

    //Errors
    UnauthorizedError,
    BadCredentialsError,

    //Setup
    LoadConfigFromEnv,
    LoadPermissions,
    CreateOrUpdateRole,
    CreateUserIfNotExist,
    RecoveryUserPassword
}


/// <reference types="index.d.ts" />
