import GraphqlMerge from "./graphql/index.js"
import UserServiceFactory from "./factory/UserServiceFactory.js";
import RoleServiceFactory from "./factory/RoleServiceFactory.js";
import TenantServiceFactory from "./factory/TenantServiceFactory.js";
import UserApiKeyServiceFactory from "./factory/UserApiKeyServiceFactory.js";
import UserLoginFailServiceFactory from "./factory/UserLoginFailServiceFactory.js";
import UserSessionServiceFactory from "./factory/UserSessionServiceFactory.js";

import RoleService from "./services/RoleService.js";
import UserService from "./services/UserService.js";
import TenantService from "./services/TenantService.js";
import PermissionService from "./services/PermissionService.js";
import UserApiKeyService from "./services/UserApiKeyService.js";
import UserSessionService from "./services/UserSessionService.js";
import UserLoginFailService from "./services/UserLoginFailService.js";

import Rbac from "./rbac/Rbac.js";

import {UserRoutes} from "./routes/UserRoutes.js";
import {RoleRoutes} from "./routes/RoleRoutes.js";
import {TenantRoutes} from "./routes/TenantRoutes.js";
import {UserApiKeyRoutes} from "./routes/UserApiKeyRoutes.js";
import {UserSessionRoutes} from "./routes/UserSessionRoutes.js";
import {UserLoginFailRoutes} from "./routes/UserLoginFailRoutes.js";

import AuthUtils from "./utils/AuthUtils.js";
import {jwtMiddleware} from "./middleware/jwtMiddleware.js";
import {rbacMiddleware} from "./middleware/rbacMiddleware.js";
import {apiKeyMiddleware} from "./middleware/apiKeyMiddleware.js";

import IdentityConfig from "./config/IdentityConfig.js";
import BadCredentialsError from "./errors/BadCredentialsError.js";

import CreateUserIfNotExist from "./setup/CreateUserIfNotExist.js";
import CreateOrUpdateRole from "./setup/CreateOrUpdateRole.js";
import LoadPermissions from "./setup/LoadPermissions.js";
import LoadIdentityConfigFromEnv from "./setup/LoadIdentityConfigFromEnv.js";
import RecoveryUserPassword from "./setup/RecoveryUserPassword.js";

import type {IRoleRepository} from "./interfaces/IRoleRepository";
import type {ITenantRepository} from "./interfaces/ITenantRepository";
import type {IUserRepository} from "./interfaces/IUserRepository";
import type {IUserApiKeyRepository} from "./interfaces/IUserApiKeyRepository";
import type {IUserLoginFailRepository} from "./interfaces/IUserLoginFailRepository";
import type {IUserSessionRepository} from "./interfaces/IUserSessionRepository";


import RoleMongoRepository from "./repository/mongo/RoleMongoRepository.js";
import TenantMongoRepository from "./repository/mongo/TenantMongoRepository.js";
import UserMongoRepository from "./repository/mongo/UserMongoRepository.js";
import UserApiKeyMongoRepository from "./repository/mongo/UserApiKeyMongoRepository.js";
import UserSessionMongoRepository from "./repository/mongo/UserSessionMongoRepository.js";
import UserLoginFailMongoRepository from "./repository/mongo/UserLoginFailMongoRepository.js";

import RoleSqliteRepository from "./repository/sqlite/RoleSqliteRepository.js";
import TenantSqliteRepository from "./repository/sqlite/TenantSqliteRepository.js";
import UserSqliteRepository from "./repository/sqlite/UserSqliteRepository.js";
import UserApiKeySqliteRepository from "./repository/sqlite/UserApiKeySqliteRepository.js";
import UserLoginFailSqliteRepository from "./repository/sqlite/UserLoginFailSqliteRepository.js";
import UserSessionSqliteRepository from "./repository/sqlite/UserSessionSqliteRepository.js";


import {RolePermissions} from "./permissions/RolePermissions.js";
import {TenantPermissions} from "./permissions/TenantPermissions.js";
import {UserPermissions} from "./permissions/UserPermissions.js";
import {UserApiKeyPermissions} from "./permissions/UserApiKeyPermissions.js";
import {UserLoginFailPermissions} from "./permissions/UserLoginFailPermissions.js";
import {UserSessionPermissions} from "./permissions/UserSessionPermissions.js";

import {UserSchema, UserBaseSchema} from "./schemas/UserSchema.js";
import {TenantSchema,TenantBaseSchema} from "./schemas/TenantSchema.js";
import {RoleSchema, RoleBaseSchema} from "./schemas/RoleSchema.js";
import {UserApiKeySchema, UserApiKeyBaseSchema} from "./schemas/UserApiKeySchema.js";
import {UserLoginFailBaseSchema, UserLoginFailSchema} from "./schemas/UserLoginFailSchema.js";
import {UserSessionBaseSchema, UserSessionSchema} from "./schemas/UserSessionSchema.js";


const graphqlMergeResult = await GraphqlMerge()
const identityTypeDefs = await graphqlMergeResult.typeDefs;
const identityResolvers = await graphqlMergeResult.resolvers;


export type {
    IRoleRepository,
    ITenantRepository,
    IUserRepository,
    IUserApiKeyRepository,
    IUserLoginFailRepository,
    IUserSessionRepository,
}

export {

    //Schemas
    UserSchema,
    UserBaseSchema,
    TenantSchema,
    TenantBaseSchema,
    RoleSchema,
    RoleBaseSchema,
    UserApiKeyBaseSchema,
    UserApiKeySchema,
    UserLoginFailBaseSchema,
    UserLoginFailSchema,
    UserSessionBaseSchema,
    UserSessionSchema,

    //Service
    UserService,
    RoleService,
    TenantService,
    UserApiKeyService,
    UserSessionService,
    UserLoginFailService,
    PermissionService,
    Rbac,

    //Factories
    UserServiceFactory,
    RoleServiceFactory,
    TenantServiceFactory,
    UserApiKeyServiceFactory,
    UserSessionServiceFactory,
    UserLoginFailServiceFactory,

    //GQL
    identityTypeDefs,
    identityResolvers,

    //API REST
    UserRoutes,
    RoleRoutes,
    TenantRoutes,
    UserApiKeyRoutes,
    UserSessionRoutes,
    UserLoginFailRoutes,

    AuthUtils,

    //API MIDDLEWARE
    jwtMiddleware,
    rbacMiddleware,
    apiKeyMiddleware,

    //Permissions
    RolePermissions,
    TenantPermissions,
    UserPermissions,
    UserApiKeyPermissions,
    UserSessionPermissions,
    UserLoginFailPermissions,

    //Mongo Repositories
    RoleMongoRepository,
    TenantMongoRepository,
    UserMongoRepository,
    UserApiKeyMongoRepository,
    UserSessionMongoRepository,
    UserLoginFailMongoRepository,

    //Sqlite Repositories
    RoleSqliteRepository,
    TenantSqliteRepository,
    UserSqliteRepository,
    UserApiKeySqliteRepository,
    UserLoginFailSqliteRepository,
    UserSessionSqliteRepository,

    //Config
    IdentityConfig,

    //Errors
    BadCredentialsError,

    //Setup
    LoadIdentityConfigFromEnv,
    LoadPermissions,
    CreateOrUpdateRole,
    CreateUserIfNotExist,
    RecoveryUserPassword
}


