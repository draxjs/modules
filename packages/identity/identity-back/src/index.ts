import GraphqlMerge from "./graphql/index.js"
import UserServiceFactory from "./factory/UserServiceFactory.js";
import RoleServiceFactory from "./factory/RoleServiceFactory.js";
import TenantServiceFactory from "./factory/TenantServiceFactory.js";
import RoleService from "./services/RoleService.js";
import UserService from "./services/UserService.js";
import TenantService from "./services/TenantService.js";
import PermissionService from "./services/PermissionService.js";
import Rbac from "./rbac/Rbac.js";
import {UserRoutes} from "./routes/UserRoutes.js";
import {RoleRoutes} from "./routes/RoleRoutes.js";
import {TenantRoutes} from "./routes/TenantRoutes.js";
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
import LoadIdentityConfigFromEnv from "./setup/LoadIdentityConfigFromEnv.js";
import RecoveryUserPassword from "./setup/RecoveryUserPassword.js";

import type {IRoleRepository} from "./interfaces/IRoleRepository";
import type {ITenantRepository} from "./interfaces/ITenantRepository";
import type {IUserRepository} from "./interfaces/IUserRepository";


const graphqlMergeResult = await GraphqlMerge()
const identityTypeDefs = await graphqlMergeResult.typeDefs;
const identityResolvers = await graphqlMergeResult.resolvers;


export type {
    IRoleRepository,
    ITenantRepository,
    IUserRepository,
}

export {
    //Service
    UserService,
    RoleService,
    TenantService,
    PermissionService,
    Rbac,

    //Factories
    UserServiceFactory,
    RoleServiceFactory,
    TenantServiceFactory,

    //GQL
    identityTypeDefs,
    identityResolvers,

    //API REST
    UserRoutes,
    RoleRoutes,
    TenantRoutes,

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
    LoadIdentityConfigFromEnv,
    LoadPermissions,
    CreateOrUpdateRole,
    CreateUserIfNotExist,
    RecoveryUserPassword
}


/// <reference types="index.d.ts" />
