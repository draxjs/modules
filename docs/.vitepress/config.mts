import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Drax Docs',
  description: 'Documentación de Drax',
  base: '/modules/',
  themeConfig: {
    search: {
      provider: 'local'
    },
    outline: {
      level: 'deep',
      label: 'En esta pagina',
    },
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Common', link: '/modules/common/' },
      { text: 'Identity', link: '/modules/identity/' },
      { text: 'Crud', link: '/modules/crud/' },
      { text: 'Audit', link: '/modules/audit/' },
      { text: 'Dashboard', link: '/modules/dashboard/' },
      { text: 'Media', link: '/modules/media/' },
      { text: 'Settings', link: '/modules/settings/' },
      { text: 'Email', link: '/modules/email/' },
      { text: 'Arch', link: '/modules/arch/' },
    ],
    sidebar: {
      '/modules/common/': [
        { text: 'Common', link: '/modules/common/' },
        {
          text: 'Backend',
          link: '/modules/common/backend',
          items: [
            {
              text: 'Cache',
              link: '/modules/common/backend/cache',
              items: [
                { text: 'DraxCache', link: '/modules/common/backend/cache/drax-cache' },
                { text: 'LocalCacheAdapter', link: '/modules/common/backend/cache/local-cache-adapter' },
                { text: 'RedisCacheAdapter', link: '/modules/common/backend/cache/redis-cache-adapter' },
              ],
            },
            {
              text: 'Config',
              link: '/modules/common/backend/config',
              items: [
                { text: 'CommonConfig', link: '/modules/common/backend/config/common-config' },
                { text: 'DraxConfig', link: '/modules/common/backend/config/drax-config' },
              ],
            },
            {
              text: 'Constants',
              link: '/modules/common/backend/constants',
              items: [
                { text: 'CommonConstants', link: '/modules/common/backend/constants/common-constants' },
              ],
            },
            {
              text: 'Controllers',
              link: '/modules/common/backend/controllers',
              items: [
                { text: 'CommonController', link: '/modules/common/backend/controllers/common-controller' },
              ],
            },
            {
              text: 'Errors',
              link: '/modules/common/backend/errors',
              items: [
                { text: 'BadRequestError', link: '/modules/common/backend/errors/bad-request-error' },
                { text: 'ForbiddenError', link: '/modules/common/backend/errors/forbidden-error' },
                { text: 'InternalServerError', link: '/modules/common/backend/errors/internal-server-error' },
                { text: 'InvalidIdError', link: '/modules/common/backend/errors/invalid-id-error' },
                { text: 'LimitError', link: '/modules/common/backend/errors/limit-error' },
                { text: 'MethodNotAllowedError', link: '/modules/common/backend/errors/method-not-allowed-error' },
                { text: 'NotFoundError', link: '/modules/common/backend/errors/not-found-error' },
                { text: 'OperationFailError', link: '/modules/common/backend/errors/operation-fail-error' },
                { text: 'SecuritySensitiveError', link: '/modules/common/backend/errors/security-sensitive-error' },
                { text: 'UnauthorizedError', link: '/modules/common/backend/errors/unauthorized-error' },
                { text: 'UniqueError', link: '/modules/common/backend/errors/unique-error' },
                { text: 'UploadFileError', link: '/modules/common/backend/errors/upload-file-error' },
                { text: 'ValidationError', link: '/modules/common/backend/errors/validation-error' },
                { text: 'ValidationFieldError', link: '/modules/common/backend/errors/validation-field-error' },
                {
                  text: 'Adapters',
                  link: '/modules/common/backend/errors/adapters',
                  items: [
                    { text: 'MongoServerErrorToValidationError', link: '/modules/common/backend/errors/adapters/mongo-server-error-to-validation-error' },
                    { text: 'MongooseCastErrorToValidationError', link: '/modules/common/backend/errors/adapters/mongoose-cast-error-to-validation-error' },
                    { text: 'MongooseValidationErrorToValidationError', link: '/modules/common/backend/errors/adapters/mongoose-validation-error-to-validation-error' },
                    { text: 'SqliteErrorToValidationError', link: '/modules/common/backend/errors/adapters/sqlite-error-to-validation-error' },
                    { text: 'ValidationErrorToGraphQLError', link: '/modules/common/backend/errors/adapters/validation-error-to-graphql-error' },
                    { text: 'ZodErrorToValidationError', link: '/modules/common/backend/errors/adapters/zod-error-to-validation-error' },
                  ],
                },
              ],
            },
            {
              text: 'GraphQL',
              link: '/modules/common/backend/graphql',
              items: [
                { text: 'index', link: '/modules/common/backend/graphql/index-file' },
                {
                  text: 'Resolvers',
                  link: '/modules/common/backend/graphql/resolvers',
                  items: [
                    { text: 'DateScalar', link: '/modules/common/backend/graphql/resolvers/date-scalar-resolvers' },
                    { text: 'common', link: '/modules/common/backend/graphql/resolvers/common-resolvers' },
                  ],
                },
                {
                  text: 'Types',
                  link: '/modules/common/backend/graphql/types',
                  items: [
                    { text: 'CommonTypes', link: '/modules/common/backend/graphql/types/common-types' },
                    { text: 'DateScalar', link: '/modules/common/backend/graphql/types/date-scalar' },
                    { text: 'FileScalar', link: '/modules/common/backend/graphql/types/file-scalar' },
                  ],
                },
              ],
            },
            {
              text: 'Interfaces',
              link: '/modules/common/backend/interfaces',
              items: [
                { text: 'ICacheAdapter', link: '/modules/common/backend/interfaces/i-cache-adapter' },
                { text: 'IDraxConfig', link: '/modules/common/backend/interfaces/i-drax-config' },
                { text: 'IError', link: '/modules/common/backend/interfaces/i-error' },
                { text: 'IQueryFilter', link: '/modules/common/backend/interfaces/i-query-filter' },
                { text: 'IUploadFile', link: '/modules/common/backend/interfaces/i-upload-file' },
                { text: 'IValidationFieldError', link: '/modules/common/backend/interfaces/i-validation-field-error' },
              ],
            },
            {
              text: 'Mongoose',
              link: '/modules/common/backend/mongoose',
              items: [
                { text: 'MongooseConector', link: '/modules/common/backend/mongoose/mongoose-conector' },
                { text: 'MongooseQueryFilter', link: '/modules/common/backend/mongoose/mongoose-query-filter' },
                { text: 'MongooseSoftDelete', link: '/modules/common/backend/mongoose/mongoose-soft-delete' },
                { text: 'MongooseSort', link: '/modules/common/backend/mongoose/mongoose-sort' },
                { text: 'MongooseTransform', link: '/modules/common/backend/mongoose/mongoose-transform' },
              ],
            },
            {
              text: 'Setup',
              link: '/modules/common/backend/setup',
              items: [
                { text: 'LoadCommonConfigFromEnv', link: '/modules/common/backend/setup/load-common-config-from-env' },
              ],
            },
            {
              text: 'SQL',
              link: '/modules/common/backend/sql',
              items: [
                { text: 'SqlQueryFilter', link: '/modules/common/backend/sql/sql-query-filter' },
                { text: 'SqlQueryFilterOld', link: '/modules/common/backend/sql/sql-query-filter-old' },
                { text: 'SqlSort', link: '/modules/common/backend/sql/sql-sort' },
              ],
            },
            {
              text: 'SQLite',
              link: '/modules/common/backend/sqlite',
              items: [
                { text: 'SqliteTableBuilder', link: '/modules/common/backend/sqlite/sqlite-table-builder' },
              ],
            },
            {
              text: 'Store',
              link: '/modules/common/backend/store',
              items: [
                { text: 'StoreManager', link: '/modules/common/backend/store/store-manager' },
                { text: 'StreamFileStore', link: '/modules/common/backend/store/stream-file-store' },
                { text: 'StreamSizeValidator', link: '/modules/common/backend/store/stream-size-validator' },
              ],
            },
            {
              text: 'Utils',
              link: '/modules/common/backend/utils',
              items: [
                { text: 'CreateDirIfNotExist', link: '/modules/common/backend/utils/create-dir-if-not-exist' },
                { text: 'GraphqlMerger', link: '/modules/common/backend/utils/graphql-merger' },
                { text: 'IsValidIsoDate', link: '/modules/common/backend/utils/is-valid-iso-date' },
                { text: 'IsValidObjectId', link: '/modules/common/backend/utils/is-valid-object-id' },
                { text: 'WorkerHandler', link: '/modules/common/backend/utils/worker-handler' },
                { text: 'setNestedValue', link: '/modules/common/backend/utils/set-nested-value' },
              ],
            },
          ],
        },
        {
          text: 'Frontend',
          link: '/modules/common/frontend',
          items: [
            {
              text: 'Clients',
              link: '/modules/common/frontend/clients',
              items: [
                { text: 'HttpGqlClient', link: '/modules/common/frontend/clients/http-gql-client' },
                { text: 'HttpRestClient', link: '/modules/common/frontend/clients/http-rest-client' },
              ],
            },
            {
              text: 'Errors',
              link: '/modules/common/frontend/errors',
              items: [
                { text: 'ClientError', link: '/modules/common/frontend/errors/client-error' },
                { text: 'NetworkError', link: '/modules/common/frontend/errors/network-error' },
                { text: 'ServerError', link: '/modules/common/frontend/errors/server-error' },
                { text: 'UnknownError', link: '/modules/common/frontend/errors/unknown-error' },
                {
                  text: 'gql',
                  link: '/modules/common/frontend/errors/gql',
                  items: [
                    { text: 'GqlError', link: '/modules/common/frontend/errors/gql/gql-error' },
                    { text: 'GqlMultiError', link: '/modules/common/frontend/errors/gql/gql-multi-error' },
                  ],
                },
                {
                  text: 'http',
                  link: '/modules/common/frontend/errors/http',
                  items: [
                    { text: 'HttpError', link: '/modules/common/frontend/errors/http/http-error' },
                    { text: 'HttpNetworkError', link: '/modules/common/frontend/errors/http/http-network-error' },
                    { text: 'HttpStatusError', link: '/modules/common/frontend/errors/http/http-status-error' },
                    { text: 'HttpTimeoutError', link: '/modules/common/frontend/errors/http/http-timeout-error' },
                  ],
                },
              ],
            },
            {
              text: 'Factories',
              link: '/modules/common/frontend/factories',
              items: [
                { text: 'HttpClientFactory', link: '/modules/common/frontend/factories/http-client-factory' },
                { text: 'HttpGqlClientFactory', link: '/modules/common/frontend/factories/http-gql-client-factory' },
                { text: 'HttpRestClientFactory', link: '/modules/common/frontend/factories/http-rest-client-factory' },
              ],
            },
            {
              text: 'Helpers',
              link: '/modules/common/frontend/helpers',
              items: [
                { text: 'debounce', link: '/modules/common/frontend/helpers/debounce' },
                { text: 'formatDate', link: '/modules/common/frontend/helpers/format-date' },
                { text: 'formatDateTime', link: '/modules/common/frontend/helpers/format-date-time' },
              ],
            },
            {
              text: 'i18n',
              link: '/modules/common/frontend/i18n',
              items: [
                { text: 'common-action-i18n', link: '/modules/common/frontend/i18n/common-action-i18n' },
                { text: 'common-crud-i18n', link: '/modules/common/frontend/i18n/common-crud-i18n' },
                { text: 'common-error-i18n', link: '/modules/common/frontend/i18n/common-error-i18n' },
                { text: 'common-i18n', link: '/modules/common/frontend/i18n/common-i18n' },
                { text: 'common-operation-i18n', link: '/modules/common/frontend/i18n/common-operation-i18n' },
                { text: 'common-validation-i18n', link: '/modules/common/frontend/i18n/common-validation-i18n' },
                { text: 'index', link: '/modules/common/frontend/i18n/index-file' },
              ],
            },
            {
              text: 'Interfaces',
              link: '/modules/common/frontend/interfaces',
              items: [
                { text: 'IClientInputError', link: '/modules/common/frontend/interfaces/i-client-input-error' },
                { text: 'IGqlClient', link: '/modules/common/frontend/interfaces/i-gql-client' },
                { text: 'IGqlError', link: '/modules/common/frontend/interfaces/i-gql-error' },
                { text: 'IHttpClient', link: '/modules/common/frontend/interfaces/i-http-client' },
                { text: 'IInputError', link: '/modules/common/frontend/interfaces/i-input-error' },
                { text: 'IRestError', link: '/modules/common/frontend/interfaces/i-rest-error' },
              ],
            },
          ],
        },
        {
          text: 'Share',
          link: '/modules/common/share',
          items: [
            {
              text: 'Interfaces',
              link: '/modules/common/share/interfaces',
              items: [
                { text: 'IDraxCommon', link: '/modules/common/share/interfaces/i-drax-common' },
                { text: 'IMenu', link: '/modules/common/share/interfaces/i-menu' },
              ],
            },
          ],
        },
        {
          text: 'Vue',
          link: '/modules/common/vue',
          items: [
            {
              text: 'Components',
              link: '/modules/common/vue/components',
              items: [
                { text: 'ColorCombobox', link: '/modules/common/vue/components/color-combobox' },
                { text: 'DraxImagePreview', link: '/modules/common/vue/components/drax-image-preview' },
                { text: 'DraxInfoItem', link: '/modules/common/vue/components/drax-info-item' },
                { text: 'GalleryMenu', link: '/modules/common/vue/components/gallery-menu' },
                { text: 'IconCombobox', link: '/modules/common/vue/components/icon-combobox' },
                { text: 'MenuCard', link: '/modules/common/vue/components/menu-card' },
                { text: 'SidebarMenu', link: '/modules/common/vue/components/sidebar-menu' },
              ],
            },
            {
              text: 'Composables',
              link: '/modules/common/vue/composables',
              items: [
                { text: 'useCopy', link: '/modules/common/vue/composables/use-copy' },
                { text: 'useDateFormat', link: '/modules/common/vue/composables/use-date-format' },
                { text: 'useI18nValidation', link: '/modules/common/vue/composables/use-i18n-validation' },
                { text: 'useMenu', link: '/modules/common/vue/composables/use-menu' },
              ],
            },
          ],
        },
      ],
      '/modules/identity/': [
        { text: 'Identity', link: '/modules/identity/' },
        {
          text: 'Backend',
          link: '/modules/identity/backend',
          items: [
            {
              text: 'Config',
              link: '/modules/identity/backend/config',
              items: [
                { text: 'IdentityConfig', link: '/modules/identity/backend/config/identity-config' },
              ],
            },
            {
              text: 'Controllers',
              link: '/modules/identity/backend/controllers',
              items: [
                { text: 'RoleController', link: '/modules/identity/backend/controllers/role-controller' },
                { text: 'TenantController', link: '/modules/identity/backend/controllers/tenant-controller' },
                { text: 'UserApiKeyController', link: '/modules/identity/backend/controllers/user-api-key-controller' },
                { text: 'UserController', link: '/modules/identity/backend/controllers/user-controller' },
                { text: 'UserLoginFailController', link: '/modules/identity/backend/controllers/user-login-fail-controller' },
                { text: 'UserSessionController', link: '/modules/identity/backend/controllers/user-session-controller' },
              ],
            },
            {
              text: 'Errors',
              link: '/modules/identity/backend/errors',
              items: [
                { text: 'BadCredentialsError', link: '/modules/identity/backend/errors/bad-credentials-error' },
              ],
            },
            {
              text: 'Factory',
              link: '/modules/identity/backend/factory',
              items: [
                { text: 'RoleServiceFactory', link: '/modules/identity/backend/factory/role-service-factory' },
                { text: 'TenantServiceFactory', link: '/modules/identity/backend/factory/tenant-service-factory' },
                { text: 'UserApiKeyServiceFactory', link: '/modules/identity/backend/factory/user-api-key-service-factory' },
                { text: 'UserLoginFailServiceFactory', link: '/modules/identity/backend/factory/user-login-fail-service-factory' },
                { text: 'UserServiceFactory', link: '/modules/identity/backend/factory/user-service-factory' },
                { text: 'UserSessionServiceFactory', link: '/modules/identity/backend/factory/user-session-service-factory' },
              ],
            },
            {
              text: 'GraphQL',
              link: '/modules/identity/backend/graphql',
              items: [
                { text: 'index', link: '/modules/identity/backend/graphql/index-file' },
              ],
            },
            {
              text: 'HTML',
              link: '/modules/identity/backend/html',
              items: [
                { text: 'RegistrationCompleteHtml', link: '/modules/identity/backend/html/registration-complete-html' },
              ],
            },
            {
              text: 'Interfaces',
              link: '/modules/identity/backend/interfaces',
              items: [
                { text: 'IRoleRepository', link: '/modules/identity/backend/interfaces/i-role-repository' },
                { text: 'ITenantRepository', link: '/modules/identity/backend/interfaces/i-tenant-repository' },
                { text: 'IUserApiKeyRepository', link: '/modules/identity/backend/interfaces/i-user-api-key-repository' },
                { text: 'IUserLoginFailRepository', link: '/modules/identity/backend/interfaces/i-user-login-fail-repository' },
                { text: 'IUserRepository', link: '/modules/identity/backend/interfaces/i-user-repository' },
                { text: 'IUserSessionRepository', link: '/modules/identity/backend/interfaces/i-user-session-repository' },
              ],
            },
            {
              text: 'Middleware',
              link: '/modules/identity/backend/middleware',
              items: [
                { text: 'apiKeyMiddleware', link: '/modules/identity/backend/middleware/api-key-middleware' },
                { text: 'jwtMiddleware', link: '/modules/identity/backend/middleware/jwt-middleware' },
                { text: 'rbacMiddleware', link: '/modules/identity/backend/middleware/rbac-middleware' },
              ],
            },
            {
              text: 'Models',
              link: '/modules/identity/backend/models',
              items: [
                { text: 'RoleModel', link: '/modules/identity/backend/models/role-model' },
                { text: 'TenantModel', link: '/modules/identity/backend/models/tenant-model' },
                { text: 'UserApiKeyModel', link: '/modules/identity/backend/models/user-api-key-model' },
                { text: 'UserGroupModel', link: '/modules/identity/backend/models/user-group-model' },
                { text: 'UserLoginFailModel', link: '/modules/identity/backend/models/user-login-fail-model' },
                { text: 'UserModel', link: '/modules/identity/backend/models/user-model' },
                { text: 'UserSessionModel', link: '/modules/identity/backend/models/user-session-model' },
              ],
            },
            {
              text: 'Permissions',
              link: '/modules/identity/backend/permissions',
              items: [
                { text: 'RolePermissions', link: '/modules/identity/backend/permissions/role-permissions' },
                { text: 'TenantPermissions', link: '/modules/identity/backend/permissions/tenant-permissions' },
                { text: 'UserApiKeyPermissions', link: '/modules/identity/backend/permissions/user-api-key-permissions' },
                { text: 'UserLoginFailPermissions', link: '/modules/identity/backend/permissions/user-login-fail-permissions' },
                { text: 'UserPermissions', link: '/modules/identity/backend/permissions/user-permissions' },
                { text: 'UserSessionPermissions', link: '/modules/identity/backend/permissions/user-session-permissions' },
                { text: 'permissions index', link: '/modules/identity/backend/permissions/index-file' },
              ],
            },
            {
              text: 'RBAC',
              link: '/modules/identity/backend/rbac',
              items: [
                { text: 'Rbac', link: '/modules/identity/backend/rbac/rbac' },
              ],
            },
            {
              text: 'Repository',
              link: '/modules/identity/backend/repository',
              items: [
                {
                  text: 'Mongo',
                  link: '/modules/identity/backend/repository/mongo',
                  items: [
                    { text: 'RoleMongoRepository', link: '/modules/identity/backend/repository/mongo/role-mongo-repository' },
                    { text: 'TenantMongoRepository', link: '/modules/identity/backend/repository/mongo/tenant-mongo-repository' },
                    { text: 'UserApiKeyMongoRepository', link: '/modules/identity/backend/repository/mongo/user-api-key-mongo-repository' },
                    { text: 'UserLoginFailMongoRepository', link: '/modules/identity/backend/repository/mongo/user-login-fail-mongo-repository' },
                    { text: 'UserMongoRepository', link: '/modules/identity/backend/repository/mongo/user-mongo-repository' },
                    { text: 'UserSessionMongoRepository', link: '/modules/identity/backend/repository/mongo/user-session-mongo-repository' },
                  ],
                },
                {
                  text: 'Sqlite',
                  link: '/modules/identity/backend/repository/sqlite',
                  items: [
                    { text: 'RoleSqliteRepository', link: '/modules/identity/backend/repository/sqlite/role-sqlite-repository' },
                    { text: 'TenantSqliteRepository', link: '/modules/identity/backend/repository/sqlite/tenant-sqlite-repository' },
                    { text: 'UserApiKeySqliteRepository', link: '/modules/identity/backend/repository/sqlite/user-api-key-sqlite-repository' },
                    { text: 'UserLoginFailSqliteRepository', link: '/modules/identity/backend/repository/sqlite/user-login-fail-sqlite-repository' },
                    { text: 'UserSessionSqliteRepository', link: '/modules/identity/backend/repository/sqlite/user-session-sqlite-repository' },
                    { text: 'UserSqliteRepository', link: '/modules/identity/backend/repository/sqlite/user-sqlite-repository' },
                  ],
                },
              ],
            },
            {
              text: 'Routes',
              link: '/modules/identity/backend/routes',
              items: [
                { text: 'RoleRoutes', link: '/modules/identity/backend/routes/role-routes' },
                { text: 'TenantRoutes', link: '/modules/identity/backend/routes/tenant-routes' },
                { text: 'UserApiKeyRoutes', link: '/modules/identity/backend/routes/user-api-key-routes' },
                { text: 'UserLoginFailRoutes', link: '/modules/identity/backend/routes/user-login-fail-routes' },
                { text: 'UserRoutes', link: '/modules/identity/backend/routes/user-routes' },
                { text: 'UserSessionRoutes', link: '/modules/identity/backend/routes/user-session-routes' },
              ],
            },
            {
              text: 'Schemas',
              link: '/modules/identity/backend/schemas',
              items: [
                { text: 'LoginSchema', link: '/modules/identity/backend/schemas/login-schema' },
                { text: 'PasswordSchema', link: '/modules/identity/backend/schemas/password-schema' },
                { text: 'RegisterSchema', link: '/modules/identity/backend/schemas/register-schema' },
                { text: 'RoleSchema', link: '/modules/identity/backend/schemas/role-schema' },
                { text: 'SwitchTenantSchema', link: '/modules/identity/backend/schemas/switch-tenant-schema' },
                { text: 'TenantSchema', link: '/modules/identity/backend/schemas/tenant-schema' },
                { text: 'TokenPayloadSchema', link: '/modules/identity/backend/schemas/token-payload-schema' },
                { text: 'UserApiKeySchema', link: '/modules/identity/backend/schemas/user-api-key-schema' },
                { text: 'UserLoginFailSchema', link: '/modules/identity/backend/schemas/user-login-fail-schema' },
                { text: 'UserSchema', link: '/modules/identity/backend/schemas/user-schema' },
                { text: 'UserSessionSchema', link: '/modules/identity/backend/schemas/user-session-schema' },
              ],
            },
            {
              text: 'Services',
              link: '/modules/identity/backend/services',
              items: [
                { text: 'PermissionService', link: '/modules/identity/backend/services/permission-service' },
                { text: 'RoleService', link: '/modules/identity/backend/services/role-service' },
                { text: 'TenantService', link: '/modules/identity/backend/services/tenant-service' },
                { text: 'UserApiKeyService', link: '/modules/identity/backend/services/user-api-key-service' },
                { text: 'UserEmailService', link: '/modules/identity/backend/services/user-email-service' },
                { text: 'UserLoginFailService', link: '/modules/identity/backend/services/user-login-fail-service' },
                { text: 'UserService', link: '/modules/identity/backend/services/user-service' },
                { text: 'UserSessionService', link: '/modules/identity/backend/services/user-session-service' },
              ],
            },
            {
              text: 'Setup',
              link: '/modules/identity/backend/setup',
              items: [
                { text: 'CreateOrUpdateRole', link: '/modules/identity/backend/setup/create-or-update-role' },
                { text: 'CreateTenantIfNotExist', link: '/modules/identity/backend/setup/create-tenant-if-not-exist' },
                { text: 'CreateUserIfNotExist', link: '/modules/identity/backend/setup/create-user-if-not-exist' },
                { text: 'LoadIdentityConfigFromEnv', link: '/modules/identity/backend/setup/load-identity-config-from-env' },
                { text: 'LoadPermissions', link: '/modules/identity/backend/setup/load-permissions' },
                { text: 'RecoveryUserPassword', link: '/modules/identity/backend/setup/recovery-user-password' },
              ],
            },
            {
              text: 'Utils',
              link: '/modules/identity/backend/utils',
              items: [
                { text: 'AuthUtils', link: '/modules/identity/backend/utils/auth-utils' },
              ],
            },
          ],
        },
        {
          text: 'Frontend',
          link: '/modules/identity/frontend',
          items: [
            {
              text: 'Errors',
              link: '/modules/identity/frontend/errors',
              items: [
                { text: 'BadCredentialsError', link: '/modules/identity/frontend/errors/bad-credentials-error' },
              ],
            },
            {
              text: 'Factory',
              link: '/modules/identity/frontend/factory',
              items: [
                { text: 'AuthSystemFactory', link: '/modules/identity/frontend/factory/auth-system-factory' },
                { text: 'RoleSystemFactory', link: '/modules/identity/frontend/factory/role-system-factory' },
                { text: 'TenantSystemFactory', link: '/modules/identity/frontend/factory/tenant-system-factory' },
                { text: 'UserApiKeySystemFactory', link: '/modules/identity/frontend/factory/user-api-key-system-factory' },
                { text: 'UserLoginFailSystemFactory', link: '/modules/identity/frontend/factory/user-login-fail-system-factory' },
                { text: 'UserSessionSystemFactory', link: '/modules/identity/frontend/factory/user-session-system-factory' },
                { text: 'UserSystemFactory', link: '/modules/identity/frontend/factory/user-system-factory' },
              ],
            },
            {
              text: 'Helpers',
              link: '/modules/identity/frontend/helpers',
              items: [
                { text: 'AuthHelper', link: '/modules/identity/frontend/helpers/auth-helper' },
                { text: 'JwtDecodeHelper', link: '/modules/identity/frontend/helpers/jwt-decode-helper' },
              ],
            },
            {
              text: 'i18n',
              link: '/modules/identity/frontend/i18n',
              items: [
                { text: 'identity-audit-i18n', link: '/modules/identity/frontend/i18n/identity-audit-i18n' },
                { text: 'identity-auth-i18n', link: '/modules/identity/frontend/i18n/identity-auth-i18n' },
                { text: 'identity-permissions-i18n', link: '/modules/identity/frontend/i18n/identity-permissions-i18n' },
                { text: 'identity-role-i18n', link: '/modules/identity/frontend/i18n/identity-role-i18n' },
                { text: 'identity-tenant-i18n', link: '/modules/identity/frontend/i18n/identity-tenant-i18n' },
                { text: 'identity-user-i18n', link: '/modules/identity/frontend/i18n/identity-user-i18n' },
                { text: 'identity-userApiKey-i18n', link: '/modules/identity/frontend/i18n/identity-user-api-key-i18n' },
                { text: 'identity-userLoginFail-i18n', link: '/modules/identity/frontend/i18n/identity-user-login-fail-i18n' },
                { text: 'identity-userSession-i18n', link: '/modules/identity/frontend/i18n/identity-user-session-i18n' },
                { text: 'identity-validation-i18n', link: '/modules/identity/frontend/i18n/identity-validation-i18n' },
                { text: 'index', link: '/modules/identity/frontend/i18n/index-file' },
              ],
            },
            {
              text: 'Interfaces',
              link: '/modules/identity/frontend/interfaces',
              items: [
                { text: 'IAuthFullUser', link: '/modules/identity/frontend/interfaces/i-auth-full-user' },
                { text: 'IAuthProvider', link: '/modules/identity/frontend/interfaces/i-auth-provider' },
                { text: 'ILoginResponse', link: '/modules/identity/frontend/interfaces/i-login-response' },
                { text: 'IRoleProvider', link: '/modules/identity/frontend/interfaces/i-role-provider' },
                { text: 'ITenantProvider', link: '/modules/identity/frontend/interfaces/i-tenant-provider' },
                { text: 'IUserApiKeyProvider', link: '/modules/identity/frontend/interfaces/i-user-api-key-provider' },
                { text: 'IUserLoginFailProvider', link: '/modules/identity/frontend/interfaces/i-user-login-fail-provider' },
                { text: 'IUserPassword', link: '/modules/identity/frontend/interfaces/i-user-password' },
                { text: 'IUserProvider', link: '/modules/identity/frontend/interfaces/i-user-provider' },
                { text: 'IUserRegistration', link: '/modules/identity/frontend/interfaces/i-user-registration' },
                { text: 'IUserSessionProvider', link: '/modules/identity/frontend/interfaces/i-user-session-provider' },
              ],
            },
            {
              text: 'Providers',
              link: '/modules/identity/frontend/providers',
              items: [
                {
                  text: 'gql',
                  link: '/modules/identity/frontend/providers/gql',
                  items: [
                    { text: 'AuthGqlProvider', link: '/modules/identity/frontend/providers/gql/auth-gql-provider' },
                    { text: 'RoleGqlProvider', link: '/modules/identity/frontend/providers/gql/role-gql-provider' },
                    { text: 'TenantGqlProvider', link: '/modules/identity/frontend/providers/gql/tenant-gql-provider' },
                    { text: 'UserApiKeyGqlProvider', link: '/modules/identity/frontend/providers/gql/user-api-key-gql-provider' },
                    { text: 'UserGqlProvider', link: '/modules/identity/frontend/providers/gql/user-gql-provider' },
                    { text: 'UserLoginFailGqlProvider', link: '/modules/identity/frontend/providers/gql/user-login-fail-gql-provider' },
                    { text: 'UserSessionGqlProvider', link: '/modules/identity/frontend/providers/gql/user-session-gql-provider' },
                  ],
                },
                {
                  text: 'rest',
                  link: '/modules/identity/frontend/providers/rest',
                  items: [
                    { text: 'AuthRestProvider', link: '/modules/identity/frontend/providers/rest/auth-rest-provider' },
                    { text: 'RoleRestProvider', link: '/modules/identity/frontend/providers/rest/role-rest-provider' },
                    { text: 'TenantRestProvider', link: '/modules/identity/frontend/providers/rest/tenant-rest-provider' },
                    { text: 'UserApiKeyRestProvider', link: '/modules/identity/frontend/providers/rest/user-api-key-rest-provider' },
                    { text: 'UserLoginFailRestProvider', link: '/modules/identity/frontend/providers/rest/user-login-fail-rest-provider' },
                    { text: 'UserRestProvider', link: '/modules/identity/frontend/providers/rest/user-rest-provider' },
                    { text: 'UserSessionRestProvider', link: '/modules/identity/frontend/providers/rest/user-session-rest-provider' },
                  ],
                },
              ],
            },
            {
              text: 'System',
              link: '/modules/identity/frontend/system',
              items: [
                { text: 'AuthSystem', link: '/modules/identity/frontend/system/auth-system' },
                { text: 'RoleSystem', link: '/modules/identity/frontend/system/role-system' },
                { text: 'TenantSystem', link: '/modules/identity/frontend/system/tenant-system' },
                { text: 'UserApiKeySystem', link: '/modules/identity/frontend/system/user-api-key-system' },
                { text: 'UserLoginFailSystem', link: '/modules/identity/frontend/system/user-login-fail-system' },
                { text: 'UserSessionSystem', link: '/modules/identity/frontend/system/user-session-system' },
                { text: 'UserSystem', link: '/modules/identity/frontend/system/user-system' },
              ],
            },
          ],
        },
        {
          text: 'Share',
          link: '/modules/identity/share',
          items: [
            {
              text: 'Interfaces',
              link: '/modules/identity/share/interfaces',
              items: [
                { text: 'IAuthUser', link: '/modules/identity/share/interfaces/i-auth-user' },
                { text: 'IJwtUser', link: '/modules/identity/share/interfaces/i-jwt-user' },
                { text: 'IRbac', link: '/modules/identity/share/interfaces/i-rbac' },
                { text: 'IRole', link: '/modules/identity/share/interfaces/i-role' },
                { text: 'ITenant', link: '/modules/identity/share/interfaces/i-tenant' },
                { text: 'IUser', link: '/modules/identity/share/interfaces/i-user' },
                { text: 'IUserApiKey', link: '/modules/identity/share/interfaces/i-user-api-key' },
                { text: 'IUserGroup', link: '/modules/identity/share/interfaces/i-user-group' },
                { text: 'IUserLoginFail', link: '/modules/identity/share/interfaces/i-user-login-fail' },
                { text: 'IUserSession', link: '/modules/identity/share/interfaces/i-user-session' },
              ],
            },
          ],
        },
        {
          text: 'Vue',
          link: '/modules/identity/vue',
          items: [
            {
              text: 'Assets',
              link: '/modules/identity/vue/assets',
              items: [
                { text: 'base.css', link: '/modules/identity/vue/assets/base-css' },
                { text: 'logo.svg', link: '/modules/identity/vue/assets/logo-svg' },
                { text: 'main.css', link: '/modules/identity/vue/assets/main-css' },
              ],
            },
            {
              text: 'Combobox',
              link: '/modules/identity/vue/combobox',
              items: [
                { text: 'PermissionCombobox', link: '/modules/identity/vue/combobox/permission-combobox' },
                { text: 'RoleCombobox', link: '/modules/identity/vue/combobox/role-combobox' },
                { text: 'TenantCombobox', link: '/modules/identity/vue/combobox/tenant-combobox' },
              ],
            },
            {
              text: 'Components',
              link: '/modules/identity/vue/components',
              items: [
                { text: 'IdentityChangeOwnPassword', link: '/modules/identity/vue/components/identity-change-own-password' },
                { text: 'IdentityLogin', link: '/modules/identity/vue/components/identity-login' },
                { text: 'IdentityProfileAvatar', link: '/modules/identity/vue/components/identity-profile-avatar' },
                { text: 'IdentityProfileAvatarEdit', link: '/modules/identity/vue/components/identity-profile-avatar-edit' },
                { text: 'IdentityProfileDrawer', link: '/modules/identity/vue/components/identity-profile-drawer' },
                { text: 'IdentityProfileView', link: '/modules/identity/vue/components/identity-profile-view' },
                { text: 'IdentityRecoveryPasswordComplete', link: '/modules/identity/vue/components/identity-recovery-password-complete' },
                { text: 'IdentityRecoveryPasswordRequest', link: '/modules/identity/vue/components/identity-recovery-password-request' },
                { text: 'IdentityRegistration', link: '/modules/identity/vue/components/identity-registration' },
                { text: 'IdentityUserGroupBy', link: '/modules/identity/vue/components/identity-user-group-by' },
                { text: 'PermissionSelector', link: '/modules/identity/vue/components/permission-selector' },
                { text: 'SwitchTenant', link: '/modules/identity/vue/components/switch-tenant' },
              ],
            },
            {
              text: 'Composables',
              link: '/modules/identity/vue/composables',
              items: [
                { text: 'useAuth', link: '/modules/identity/vue/composables/use-auth' },
                { text: 'useRole', link: '/modules/identity/vue/composables/use-role' },
                { text: 'useTenant', link: '/modules/identity/vue/composables/use-tenant' },
                { text: 'useUser', link: '/modules/identity/vue/composables/use-user' },
                { text: 'useUserApiKey', link: '/modules/identity/vue/composables/use-user-api-key' },
              ],
            },
            {
              text: 'Cruds',
              link: '/modules/identity/vue/cruds',
              items: [
                { text: 'UserLoginFailCrud', link: '/modules/identity/vue/cruds/user-login-fail-crud' },
                { text: 'UserSessionCrud', link: '/modules/identity/vue/cruds/user-session-crud' },
                {
                  text: 'role-crud',
                  link: '/modules/identity/vue/cruds/role-crud',
                  items: [
                    { text: 'RoleCrud', link: '/modules/identity/vue/cruds/role-crud/role-crud' },
                    { text: 'RoleForm', link: '/modules/identity/vue/cruds/role-crud/role-form' },
                  ],
                },
                {
                  text: 'tenant-crud',
                  link: '/modules/identity/vue/cruds/tenant-crud',
                  items: [
                    { text: 'TenantCrud', link: '/modules/identity/vue/cruds/tenant-crud/tenant-crud' },
                  ],
                },
                {
                  text: 'user-api-key-crud',
                  link: '/modules/identity/vue/cruds/user-api-key-crud',
                  items: [
                    { text: 'UserApiKeyCreated', link: '/modules/identity/vue/cruds/user-api-key-crud/user-api-key-created' },
                    { text: 'UserApiKeyCrud', link: '/modules/identity/vue/cruds/user-api-key-crud/user-api-key-crud' },
                    { text: 'UserApiKeyForm', link: '/modules/identity/vue/cruds/user-api-key-crud/user-api-key-form' },
                  ],
                },
                {
                  text: 'user-crud',
                  link: '/modules/identity/vue/cruds/user-crud',
                  items: [
                    { text: 'PasswordUpdateButton', link: '/modules/identity/vue/cruds/user-crud/password-update-button' },
                    { text: 'UserCrud', link: '/modules/identity/vue/cruds/user-crud/user-crud' },
                    { text: 'UserForm', link: '/modules/identity/vue/cruds/user-crud/user-form' },
                    { text: 'UserPasswordDialog', link: '/modules/identity/vue/cruds/user-crud/user-password-dialog' },
                    { text: 'UserPasswordForm', link: '/modules/identity/vue/cruds/user-crud/user-password-form' },
                  ],
                },
              ],
            },
            {
              text: 'i18n',
              link: '/modules/identity/vue/i18n',
              items: [
                { text: 'UserLoginFail-i18n', link: '/modules/identity/vue/i18n/user-login-fail-i18n' },
                { text: 'UserSession-i18n', link: '/modules/identity/vue/i18n/user-session-i18n' },
              ],
            },
            {
              text: 'Icons',
              link: '/modules/identity/vue/icons',
              items: [
                { text: 'IconCommunity', link: '/modules/identity/vue/icons/icon-community' },
              ],
            },
            {
              text: 'Pages',
              link: '/modules/identity/vue/pages',
              items: [
                { text: 'LoginPage', link: '/modules/identity/vue/pages/login-page' },
                { text: 'PasswordChangePage', link: '/modules/identity/vue/pages/password-change-page' },
                { text: 'PasswordRecoveryCompletePage', link: '/modules/identity/vue/pages/password-recovery-complete-page' },
                { text: 'PasswordRecoveryRequestPage', link: '/modules/identity/vue/pages/password-recovery-request-page' },
                { text: 'ProfilePage', link: '/modules/identity/vue/pages/profile-page' },
                { text: 'RegistrationPage', link: '/modules/identity/vue/pages/registration-page' },
                {
                  text: 'crud',
                  link: '/modules/identity/vue/pages/crud',
                  items: [
                    { text: 'RoleCrudPage', link: '/modules/identity/vue/pages/crud/role-crud-page' },
                    { text: 'TenantCrudPage', link: '/modules/identity/vue/pages/crud/tenant-crud-page' },
                    { text: 'UserApiKeyCrudPage', link: '/modules/identity/vue/pages/crud/user-api-key-crud-page' },
                    { text: 'UserCrudPage', link: '/modules/identity/vue/pages/crud/user-crud-page' },
                    { text: 'UserLoginFailCrudPage', link: '/modules/identity/vue/pages/crud/user-login-fail-crud-page' },
                    { text: 'UserSessionCrudPage', link: '/modules/identity/vue/pages/crud/user-session-crud-page' },
                  ],
                },
              ],
            },
            {
              text: 'Routes',
              link: '/modules/identity/vue/routes',
              items: [
                { text: 'IdentityAuthRoutes', link: '/modules/identity/vue/routes/identity-auth-routes' },
                { text: 'IdentityCrudRoutes', link: '/modules/identity/vue/routes/identity-crud-routes' },
                { text: 'IdentityRoutes', link: '/modules/identity/vue/routes/identity-routes' },
                { text: 'UserLoginFailCrudRoute', link: '/modules/identity/vue/routes/user-login-fail-crud-route' },
                { text: 'UserSessionCrudRoute', link: '/modules/identity/vue/routes/user-session-crud-route' },
              ],
            },
            {
              text: 'Stores',
              link: '/modules/identity/vue/stores',
              items: [
                { text: 'AuthStore', link: '/modules/identity/vue/stores/auth-store' },
                { text: 'IdentityCrudStore', link: '/modules/identity/vue/stores/identity-crud-store' },
              ],
            },
            {
              text: 'Views',
              link: '/modules/identity/vue/views',
              items: [
                { text: 'RoleView', link: '/modules/identity/vue/views/role-view' },
                { text: 'TenantView', link: '/modules/identity/vue/views/tenant-view' },
                { text: 'UserApiKeyView', link: '/modules/identity/vue/views/user-api-key-view' },
                { text: 'UserView', link: '/modules/identity/vue/views/user-view' },
              ],
            },
          ],
        },
      ],
      '/modules/crud/': [
        { text: 'Crud', link: '/modules/crud/' },
        {
          text: 'Backend',
          link: '/modules/crud/backend',
          items: [
            {
              text: 'Builders',
              link: '/modules/crud/backend/builders',
              items: [
                { text: 'CrudSchemaBuilder', link: '/modules/crud/backend/builders/crud-schema-builder' },
              ],
            },
            {
              text: 'Controllers',
              link: '/modules/crud/backend/controllers',
              items: [
                { text: 'AbstractFastifyController', link: '/modules/crud/backend/controllers/abstract-fastify-controller' },
              ],
            },
            {
              text: 'Events',
              link: '/modules/crud/backend/events',
              items: [
                { text: 'CrudEventEmitter', link: '/modules/crud/backend/events/crud-event-emitter' },
              ],
            },
            { text: 'Exports', link: '/modules/crud/backend/exports' },
            { text: 'Imports', link: '/modules/crud/backend/imports' },
            { text: 'Regexs', link: '/modules/crud/backend/regexs' },
            {
              text: 'Repository',
              link: '/modules/crud/backend/repository',
              items: [
                { text: 'AbstractMongoRepository', link: '/modules/crud/backend/repository/abstract-mongo-repository' },
                { text: 'AbstractSqliteRepository', link: '/modules/crud/backend/repository/abstract-sqlite-repository' },
              ],
            },
            { text: 'Schemas', link: '/modules/crud/backend/schemas' },
            { text: 'Services', link: '/modules/crud/backend/services' },
            { text: 'Workers', link: '/modules/crud/backend/workers' },
          ],
        },
        {
          text: 'Frontend',
          link: '/modules/crud/frontend',
          items: [{ text: 'Providers', link: '/modules/crud/frontend/providers' }],
        },
        {
          text: 'Share',
          link: '/modules/crud/share',
          items: [{ text: 'Interfaces', link: '/modules/crud/share/interfaces' }],
        },
        {
          text: 'Vue',
          link: '/modules/crud/vue',
          items: [
            {
              text: 'Crud',
              link: '/modules/crud/vue/crud',
              items: [
                { text: 'EntityCrud', link: '/modules/crud/vue/crud/entity-crud' },
                { text: 'Ejemplo de Extension', link: '/modules/crud/vue/crud/entity-crud-example' },
              ],
            },
            {
              text: 'Components',
              link: '/modules/crud/vue/components',
              items: [
                { text: 'Crud', link: '/modules/crud/vue/components/crud' },
                { text: 'CrudList', link: '/modules/crud/vue/components/crud-list' },
                { text: 'CrudListTable', link: '/modules/crud/vue/components/crud-list-table' },
                { text: 'CrudListGallery', link: '/modules/crud/vue/components/crud-list-gallery' },
                { text: 'CrudDialog', link: '/modules/crud/vue/components/crud-dialog' },
                { text: 'CrudForm', link: '/modules/crud/vue/components/crud-form' },
                { text: 'CrudFormField', link: '/modules/crud/vue/components/crud-form-field' },
                { text: 'CrudFormList', link: '/modules/crud/vue/components/crud-form-list' },
                { text: 'CrudFormRecord', link: '/modules/crud/vue/components/crud-form-record' },
                { text: 'CrudFilters', link: '/modules/crud/vue/components/crud-filters' },
                { text: 'CrudFiltersDynamic', link: '/modules/crud/vue/components/crud-filters-dynamic' },
                { text: 'CrudFiltersAction', link: '/modules/crud/vue/components/crud-filters-action' },
                { text: 'CrudActiveFilters', link: '/modules/crud/vue/components/crud-active-filters' },
                { text: 'CrudSearch', link: '/modules/crud/vue/components/crud-search' },
                { text: 'CrudAutocomplete', link: '/modules/crud/vue/components/crud-autocomplete' },
                { text: 'CrudRefDisplay', link: '/modules/crud/vue/components/crud-ref-display' },
                { text: 'CrudExportList', link: '/modules/crud/vue/components/crud-export-list' },
                { text: 'CrudNotify', link: '/modules/crud/vue/components/crud-notify' },
                {
                  text: 'Buttons',
                  link: '/modules/crud/vue/components/buttons',
                  items: [
                    { text: 'CrudCreateButton', link: '/modules/crud/vue/components/buttons/crud-create-button' },
                    { text: 'CrudCreateOnTheFlyButton', link: '/modules/crud/vue/components/buttons/crud-create-on-the-fly-button' },
                    { text: 'CrudUpdateButton', link: '/modules/crud/vue/components/buttons/crud-update-button' },
                    { text: 'CrudDeleteButton', link: '/modules/crud/vue/components/buttons/crud-delete-button' },
                    { text: 'CrudViewButton', link: '/modules/crud/vue/components/buttons/crud-view-button' },
                    { text: 'CrudFilterButton', link: '/modules/crud/vue/components/buttons/crud-filter-button' },
                    { text: 'CrudColumnsButton', link: '/modules/crud/vue/components/buttons/crud-columns-button' },
                    { text: 'CrudExportButton', link: '/modules/crud/vue/components/buttons/crud-export-button' },
                    { text: 'CrudImportButton', link: '/modules/crud/vue/components/buttons/crud-import-button' },
                    { text: 'CrudGroupByButton', link: '/modules/crud/vue/components/buttons/crud-group-by-button' },
                  ],
                },
                {
                  text: 'Combobox',
                  link: '/modules/crud/vue/components/combobox',
                  items: [
                    { text: 'EntityCombobox', link: '/modules/crud/vue/components/combobox/entity-combobox' },
                  ],
                },
              ],
            },
            {
              text: 'Composables',
              link: '/modules/crud/vue/composables',
              items: [
                { text: 'useCrud', link: '/modules/crud/vue/composables/use-crud' },
                { text: 'useCrudColumns', link: '/modules/crud/vue/composables/use-crud-columns' },
                { text: 'useCrudGroupBy', link: '/modules/crud/vue/composables/use-crud-group-by' },
                { text: 'useDynamicFilters', link: '/modules/crud/vue/composables/use-dynamic-filters' },
                { text: 'useFilterIcon', link: '/modules/crud/vue/composables/use-filter-icon' },
                { text: 'useFormUtils', link: '/modules/crud/vue/composables/use-form-utils' },
                { text: 'useInputErrorI18n', link: '/modules/crud/vue/composables/use-input-error-i18n' },
                { text: 'useCrudRefDisplay', link: '/modules/crud/vue/composables/use-crud-ref-display' },
              ],
            },
            { text: 'Helpers', link: '/modules/crud/vue/helpers' },
            {
              text: 'Stores',
              link: '/modules/crud/vue/stores',
              items: [
                { text: 'useCrudStore', link: '/modules/crud/vue/stores/use-crud-store' },
                { text: 'useEntityStore', link: '/modules/crud/vue/stores/use-entity-store' },
                { text: 'useGroupByStore', link: '/modules/crud/vue/stores/use-group-by-store' },
              ],
            },
          ],
        },
      ],
      '/modules/audit/': [
        { text: 'Audit', link: '/modules/audit/' },
        {
          text: 'Backend',
          link: '/modules/audit/backend',
          items: [
            {
              text: 'Controllers',
              link: '/modules/audit/backend/controllers',
              items: [
                { text: 'AuditController', link: '/modules/audit/backend/controllers/audit-controller' },
              ],
            },
            {
              text: 'Factory',
              link: '/modules/audit/backend/factory',
              items: [
                {
                  text: 'Services',
                  link: '/modules/audit/backend/factory/services',
                  items: [
                    { text: 'AuditServiceFactory', link: '/modules/audit/backend/factory/services/audit-service-factory' },
                  ],
                },
              ],
            },
            {
              text: 'Interfaces',
              link: '/modules/audit/backend/interfaces',
              items: [
                { text: 'IAuditRepository', link: '/modules/audit/backend/interfaces/i-audit-repository' },
              ],
            },
            {
              text: 'Models',
              link: '/modules/audit/backend/models',
              items: [
                { text: 'AuditModel', link: '/modules/audit/backend/models/audit-model' },
              ],
            },
            {
              text: 'Permissions',
              link: '/modules/audit/backend/permissions',
              items: [
                { text: 'AuditPermissions', link: '/modules/audit/backend/permissions/audit-permissions' },
              ],
            },
            {
              text: 'Repository',
              link: '/modules/audit/backend/repository',
              items: [
                {
                  text: 'Mongo',
                  link: '/modules/audit/backend/repository/mongo',
                  items: [
                    { text: 'AuditMongoRepository', link: '/modules/audit/backend/repository/mongo/audit-mongo-repository' },
                  ],
                },
                {
                  text: 'Sqlite',
                  link: '/modules/audit/backend/repository/sqlite',
                  items: [
                    { text: 'AuditSqliteRepository', link: '/modules/audit/backend/repository/sqlite/audit-sqlite-repository' },
                  ],
                },
              ],
            },
            {
              text: 'Routes',
              link: '/modules/audit/backend/routes',
              items: [
                { text: 'AuditRoutes', link: '/modules/audit/backend/routes/audit-routes' },
              ],
            },
            {
              text: 'Schemas',
              link: '/modules/audit/backend/schemas',
              items: [
                { text: 'AuditSchema', link: '/modules/audit/backend/schemas/audit-schema' },
              ],
            },
            {
              text: 'Services',
              link: '/modules/audit/backend/services',
              items: [
                { text: 'AuditService', link: '/modules/audit/backend/services/audit-service' },
              ],
            },
            {
              text: 'Utils',
              link: '/modules/audit/backend/utils',
              items: [
                { text: 'RegisterCrudEvent', link: '/modules/audit/backend/utils/register-crud-event' },
              ],
            },
          ],
        },
        {
          text: 'Frontend',
          link: '/modules/audit/frontend',
          items: [
            {
              text: 'i18n',
              link: '/modules/audit/frontend/i18n',
              items: [
                { text: 'AuditI18n', link: '/modules/audit/frontend/i18n/audit-i18n' },
                { text: 'AuditActionsI18n', link: '/modules/audit/frontend/i18n/audit-actions-i18n' },
                { text: 'index', link: '/modules/audit/frontend/i18n/index-file' },
              ],
            },
            {
              text: 'Providers',
              link: '/modules/audit/frontend/providers',
              items: [
                { text: 'AuditProvider', link: '/modules/audit/frontend/providers/audit-provider' },
              ],
            },
          ],
        },
        {
          text: 'Share',
          link: '/modules/audit/share',
          items: [
            {
              text: 'Interfaces',
              link: '/modules/audit/share/interfaces',
              items: [
                { text: 'IAudit', link: '/modules/audit/share/interfaces/i-audit' },
              ],
            },
          ],
        },
        {
          text: 'Vue',
          link: '/modules/audit/vue',
          items: [
            {
              text: 'Components',
              link: '/modules/audit/vue/components',
              items: [
                { text: 'AuditDashboard', link: '/modules/audit/vue/components/audit-dashboard' },
                { text: 'AuditView', link: '/modules/audit/vue/components/audit-view' },
              ],
            },
            {
              text: 'Cruds',
              link: '/modules/audit/vue/cruds',
              items: [
                { text: 'AuditCrud', link: '/modules/audit/vue/cruds/audit-crud' },
              ],
            },
            {
              text: 'Dashboards',
              link: '/modules/audit/vue/dashboards',
              items: [
                { text: 'AuditDashboard', link: '/modules/audit/vue/dashboards/audit-dashboard' },
              ],
            },
            {
              text: 'Pages',
              link: '/modules/audit/vue/pages',
              items: [
                {
                  text: 'Crud',
                  link: '/modules/audit/vue/pages/crud',
                  items: [
                    { text: 'AuditCrudPage', link: '/modules/audit/vue/pages/crud/audit-crud-page' },
                    { text: 'AuditCrudDashboardPage', link: '/modules/audit/vue/pages/crud/audit-crud-dashboard-page' },
                  ],
                },
              ],
            },
            {
              text: 'Routes',
              link: '/modules/audit/vue/routes',
              items: [
                { text: 'AuditCrudRoute', link: '/modules/audit/vue/routes/audit-crud-route' },
                { text: 'index', link: '/modules/audit/vue/routes/index-file' },
              ],
            },
          ],
        },
      ],
      '/modules/dashboard/': [
        { text: 'Dashboard', link: '/modules/dashboard/' },
        {
          text: 'Backend',
          link: '/modules/dashboard/backend',
          items: [
            {
              text: 'Controllers',
              link: '/modules/dashboard/backend/controllers',
              items: [
                { text: 'DashboardController', link: '/modules/dashboard/backend/controllers/dashboard-controller' },
              ],
            },
            {
              text: 'Factory',
              link: '/modules/dashboard/backend/factory',
              items: [
                {
                  text: 'Services',
                  link: '/modules/dashboard/backend/factory/services',
                  items: [
                    { text: 'DashboardServiceFactory', link: '/modules/dashboard/backend/factory/services/dashboard-service-factory' },
                  ],
                },
              ],
            },
            {
              text: 'Interfaces',
              link: '/modules/dashboard/backend/interfaces',
              items: [
                { text: 'IDashboardRepository', link: '/modules/dashboard/backend/interfaces/i-dashboard-repository' },
              ],
            },
            {
              text: 'Models',
              link: '/modules/dashboard/backend/models',
              items: [
                { text: 'DashboardModel', link: '/modules/dashboard/backend/models/dashboard-model' },
              ],
            },
            {
              text: 'Permissions',
              link: '/modules/dashboard/backend/permissions',
              items: [
                { text: 'DashboardPermissions', link: '/modules/dashboard/backend/permissions/dashboard-permissions' },
              ],
            },
            {
              text: 'Repository',
              link: '/modules/dashboard/backend/repository',
              items: [
                {
                  text: 'Mongo',
                  link: '/modules/dashboard/backend/repository/mongo',
                  items: [
                    { text: 'DashboardMongoRepository', link: '/modules/dashboard/backend/repository/mongo/dashboard-mongo-repository' },
                  ],
                },
                {
                  text: 'Sqlite',
                  link: '/modules/dashboard/backend/repository/sqlite',
                  items: [
                    { text: 'DashboardSqliteRepository', link: '/modules/dashboard/backend/repository/sqlite/dashboard-sqlite-repository' },
                  ],
                },
              ],
            },
            {
              text: 'Routes',
              link: '/modules/dashboard/backend/routes',
              items: [
                { text: 'DashboardRoutes', link: '/modules/dashboard/backend/routes/dashboard-routes' },
              ],
            },
            {
              text: 'Schemas',
              link: '/modules/dashboard/backend/schemas',
              items: [
                { text: 'DashboardSchema', link: '/modules/dashboard/backend/schemas/dashboard-schema' },
              ],
            },
            {
              text: 'Services',
              link: '/modules/dashboard/backend/services',
              items: [
                { text: 'DashboardService', link: '/modules/dashboard/backend/services/dashboard-service' },
              ],
            },
          ],
        },
        {
          text: 'Frontend',
          link: '/modules/dashboard/frontend',
          items: [
            {
              text: 'i18n',
              link: '/modules/dashboard/frontend/i18n',
              items: [
                { text: 'DashboardI18n', link: '/modules/dashboard/frontend/i18n/dashboard-i18n' },
                { text: 'index', link: '/modules/dashboard/frontend/i18n/index-file' },
              ],
            },
            {
              text: 'Providers',
              link: '/modules/dashboard/frontend/providers',
              items: [
                { text: 'DashboardProvider', link: '/modules/dashboard/frontend/providers/dashboard-provider' },
              ],
            },
          ],
        },
        {
          text: 'Share',
          link: '/modules/dashboard/share',
          items: [
            {
              text: 'Interfaces',
              link: '/modules/dashboard/share/interfaces',
              items: [
                { text: 'IDashboard', link: '/modules/dashboard/share/interfaces/i-dashboard' },
              ],
            },
          ],
        },
        {
          text: 'Vue',
          link: '/modules/dashboard/vue',
          items: [
            {
              text: 'Combobox',
              link: '/modules/dashboard/vue/combobox',
              items: [
                { text: 'DashboardCombobox', link: '/modules/dashboard/vue/combobox/dashboard-combobox' },
              ],
            },
            {
              text: 'Components',
              link: '/modules/dashboard/vue/components',
              items: [
                {
                  text: 'DashboardConfig',
                  link: '/modules/dashboard/vue/components/dashboard-config',
                  items: [
                    { text: 'DashboardConfig', link: '/modules/dashboard/vue/components/dashboard-config/dashboard-config' },
                    { text: 'DashboardCardEditor', link: '/modules/dashboard/vue/components/dashboard-config/dashboard-card-editor' },
                  ],
                },
                {
                  text: 'DashboardView',
                  link: '/modules/dashboard/vue/components/dashboard-view',
                  items: [
                    { text: 'DashboardView', link: '/modules/dashboard/vue/components/dashboard-view/dashboard-view' },
                  ],
                },
                {
                  text: 'GroupByCard',
                  link: '/modules/dashboard/vue/components/group-by-card',
                  items: [
                    { text: 'GroupByCard', link: '/modules/dashboard/vue/components/group-by-card/group-by-card' },
                    {
                      text: 'Renders',
                      link: '/modules/dashboard/vue/components/group-by-card/renders',
                      items: [
                        { text: 'GroupByTableRender', link: '/modules/dashboard/vue/components/group-by-card/renders/group-by-table-render' },
                        { text: 'GroupByPieRender', link: '/modules/dashboard/vue/components/group-by-card/renders/group-by-pie-render' },
                        { text: 'GroupByBarsRender', link: '/modules/dashboard/vue/components/group-by-card/renders/group-by-bars-render' },
                        { text: 'GroupByGalleryRender', link: '/modules/dashboard/vue/components/group-by-card/renders/group-by-gallery-render' },
                      ],
                    },
                  ],
                },
                {
                  text: 'PaginateCard',
                  link: '/modules/dashboard/vue/components/paginate-card',
                  items: [
                    { text: 'PaginateCard', link: '/modules/dashboard/vue/components/paginate-card/paginate-card' },
                    {
                      text: 'Renders',
                      link: '/modules/dashboard/vue/components/paginate-card/renders',
                      items: [
                        { text: 'PaginateTableRender', link: '/modules/dashboard/vue/components/paginate-card/renders/paginate-table-render' },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              text: 'Composables',
              link: '/modules/dashboard/vue/composables',
              items: [
                { text: 'useDashboardCard', link: '/modules/dashboard/vue/composables/use-dashboard-card' },
              ],
            },
            {
              text: 'Cruds',
              link: '/modules/dashboard/vue/cruds',
              items: [
                { text: 'DashboardCrud', link: '/modules/dashboard/vue/cruds/dashboard-crud' },
              ],
            },
            {
              text: 'Pages',
              link: '/modules/dashboard/vue/pages',
              items: [
                { text: 'DashboardConfigPage', link: '/modules/dashboard/vue/pages/dashboard-config-page' },
                { text: 'DashboardIdentifierPage', link: '/modules/dashboard/vue/pages/dashboard-identifier-page' },
                { text: 'DashboardViewPage', link: '/modules/dashboard/vue/pages/dashboard-view-page' },
                {
                  text: 'Crud',
                  link: '/modules/dashboard/vue/pages/crud',
                  items: [
                    { text: 'DashboardCrudPage', link: '/modules/dashboard/vue/pages/crud/dashboard-crud-page' },
                  ],
                },
              ],
            },
            {
              text: 'Routes',
              link: '/modules/dashboard/vue/routes',
              items: [
                { text: 'DashboardCrudRoute', link: '/modules/dashboard/vue/routes/dashboard-crud-route' },
              ],
            },
            {
              text: 'Stores',
              link: '/modules/dashboard/vue/stores',
              items: [
                { text: 'useDashboardStore', link: '/modules/dashboard/vue/stores/use-dashboard-store' },
              ],
            },
          ],
        },
      ],
      '/modules/media/': [
        { text: 'Media', link: '/modules/media/' },
        {
          text: 'Backend',
          link: '/modules/media/backend',
          items: [
            {
              text: 'Controllers',
              link: '/modules/media/backend/controllers',
              items: [
                { text: 'FileController', link: '/modules/media/backend/controllers/file-controller' },
                { text: 'MediaController', link: '/modules/media/backend/controllers/media-controller' },
              ],
            },
            {
              text: 'Factory',
              link: '/modules/media/backend/factory',
              items: [
                {
                  text: 'Services',
                  link: '/modules/media/backend/factory/services',
                  items: [
                    { text: 'FileServiceFactory', link: '/modules/media/backend/factory/services/file-service-factory' },
                  ],
                },
              ],
            },
            {
              text: 'Interfaces',
              link: '/modules/media/backend/interfaces',
              items: [
                { text: 'IFile', link: '/modules/media/backend/interfaces/i-file' },
                { text: 'IFileRepository', link: '/modules/media/backend/interfaces/i-file-repository' },
              ],
            },
            {
              text: 'Models',
              link: '/modules/media/backend/models',
              items: [
                { text: 'FileModel', link: '/modules/media/backend/models/file-model' },
              ],
            },
            {
              text: 'Permissions',
              link: '/modules/media/backend/permissions',
              items: [
                { text: 'FilePermissions', link: '/modules/media/backend/permissions/file-permissions' },
                { text: 'MediaPermissions', link: '/modules/media/backend/permissions/media-permissions' },
              ],
            },
            {
              text: 'Repository',
              link: '/modules/media/backend/repository',
              items: [
                {
                  text: 'Mongo',
                  link: '/modules/media/backend/repository/mongo',
                  items: [
                    { text: 'FileMongoRepository', link: '/modules/media/backend/repository/mongo/file-mongo-repository' },
                  ],
                },
                {
                  text: 'Sqlite',
                  link: '/modules/media/backend/repository/sqlite',
                  items: [
                    { text: 'FileSqliteRepository', link: '/modules/media/backend/repository/sqlite/file-sqlite-repository' },
                  ],
                },
              ],
            },
            {
              text: 'Routes',
              link: '/modules/media/backend/routes',
              items: [
                { text: 'FileRoutes', link: '/modules/media/backend/routes/file-routes' },
                { text: 'MediaRoutes', link: '/modules/media/backend/routes/media-routes' },
              ],
            },
            {
              text: 'Schemas',
              link: '/modules/media/backend/schemas',
              items: [
                { text: 'FileSchema', link: '/modules/media/backend/schemas/file-schema' },
              ],
            },
            {
              text: 'Services',
              link: '/modules/media/backend/services',
              items: [
                { text: 'FileService', link: '/modules/media/backend/services/file-service' },
              ],
            },
          ],
        },
        {
          text: 'Frontend',
          link: '/modules/media/frontend',
          items: [
            {
              text: 'Factory',
              link: '/modules/media/frontend/factory',
              items: [
                { text: 'FileSystemFactory', link: '/modules/media/frontend/factory/file-system-factory' },
                { text: 'MediaSystemFactory', link: '/modules/media/frontend/factory/media-system-factory' },
              ],
            },
            {
              text: 'i18n',
              link: '/modules/media/frontend/i18n',
              items: [
                { text: 'FileI18n', link: '/modules/media/frontend/i18n/file-i18n' },
                { text: 'MediaPermissionsI18n', link: '/modules/media/frontend/i18n/media-permissions-i18n' },
                { text: 'index', link: '/modules/media/frontend/i18n/index-file' },
              ],
            },
            {
              text: 'Interfaces',
              link: '/modules/media/frontend/interfaces',
              items: [
                { text: 'IFileProvider', link: '/modules/media/frontend/interfaces/i-file-provider' },
                { text: 'IMediaProvider', link: '/modules/media/frontend/interfaces/i-media-provider' },
              ],
            },
            {
              text: 'Providers',
              link: '/modules/media/frontend/providers',
              items: [
                { text: 'FileProvider', link: '/modules/media/frontend/providers/file-provider' },
                {
                  text: 'Gql',
                  link: '/modules/media/frontend/providers/gql',
                  items: [
                    { text: 'FileGqlProvider', link: '/modules/media/frontend/providers/gql/file-gql-provider' },
                    { text: 'MediaGqlProvider', link: '/modules/media/frontend/providers/gql/media-gql-provider' },
                  ],
                },
                {
                  text: 'Rest',
                  link: '/modules/media/frontend/providers/rest',
                  items: [
                    { text: 'FileRestProvider', link: '/modules/media/frontend/providers/rest/file-rest-provider' },
                    { text: 'MediaRestProvider', link: '/modules/media/frontend/providers/rest/media-rest-provider' },
                  ],
                },
              ],
            },
            {
              text: 'System',
              link: '/modules/media/frontend/system',
              items: [
                { text: 'FileSystem', link: '/modules/media/frontend/system/file-system' },
                { text: 'MediaSystem', link: '/modules/media/frontend/system/media-system' },
              ],
            },
          ],
        },
        {
          text: 'Share',
          link: '/modules/media/share',
          items: [
            {
              text: 'Interfaces',
              link: '/modules/media/share/interfaces',
              items: [
                { text: 'IFile', link: '/modules/media/share/interfaces/i-file' },
                { text: 'IMediaFile', link: '/modules/media/share/interfaces/i-media-file' },
              ],
            },
          ],
        },
        {
          text: 'Vue',
          link: '/modules/media/vue',
          items: [
            {
              text: 'Comboboxes',
              link: '/modules/media/vue/comboboxes',
              items: [
                { text: 'FileCombobox', link: '/modules/media/vue/comboboxes/file-combobox' },
              ],
            },
            {
              text: 'Components',
              link: '/modules/media/vue/components',
              items: [
                { text: 'MediaField', link: '/modules/media/vue/components/media-field' },
                { text: 'MediaFieldView', link: '/modules/media/vue/components/media-field-view' },
                { text: 'MediaFullField', link: '/modules/media/vue/components/media-full-field' },
                {
                  text: 'Cruds',
                  link: '/modules/media/vue/components/cruds',
                  items: [
                    { text: 'FileCrud', link: '/modules/media/vue/components/cruds/file-crud' },
                  ],
                },
              ],
            },
            { text: 'Composables', link: '/modules/media/vue/composables' },
            {
              text: 'Cruds',
              link: '/modules/media/vue/cruds',
              items: [
                { text: 'FileEntityCrud', link: '/modules/media/vue/cruds/file-entity-crud' },
              ],
            },
            {
              text: 'Pages',
              link: '/modules/media/vue/pages',
              items: [
                {
                  text: 'Crud',
                  link: '/modules/media/vue/pages/crud',
                  items: [
                    { text: 'FileCrudPage', link: '/modules/media/vue/pages/crud/file-crud-page' },
                  ],
                },
              ],
            },
            {
              text: 'Routes',
              link: '/modules/media/vue/routes',
              items: [
                { text: 'FileCrudRoute', link: '/modules/media/vue/routes/file-crud-route' },
                { text: 'index', link: '/modules/media/vue/routes/index-file' },
              ],
            },
          ],
        },
      ],
      '/modules/settings/': [
        { text: 'Settings', link: '/modules/settings/' },
        {
          text: 'Backend',
          link: '/modules/settings/backend',
          items: [
            {
              text: 'Controller',
              link: '/modules/settings/backend/controller',
              items: [
                { text: 'SettingController', link: '/modules/settings/backend/controller/setting-controller' },
              ],
            },
            {
              text: 'Factory',
              link: '/modules/settings/backend/factory',
              items: [
                { text: 'SettingServiceFactory', link: '/modules/settings/backend/factory/setting-service-factory' },
              ],
            },
            {
              text: 'Interfaces',
              link: '/modules/settings/backend/interfaces',
              items: [
                { text: 'ISettingRepository', link: '/modules/settings/backend/interfaces/i-setting-repository' },
              ],
            },
            {
              text: 'Model',
              link: '/modules/settings/backend/model',
              items: [
                { text: 'SettingsModel', link: '/modules/settings/backend/model/settings-model' },
              ],
            },
            {
              text: 'Permissions',
              link: '/modules/settings/backend/permissions',
              items: [
                { text: 'SettingPermissions', link: '/modules/settings/backend/permissions/setting-permissions' },
              ],
            },
            {
              text: 'Repository',
              link: '/modules/settings/backend/repository',
              items: [
                {
                  text: 'Mongo',
                  link: '/modules/settings/backend/repository/mongo',
                  items: [
                    { text: 'SettingMongoRepository', link: '/modules/settings/backend/repository/mongo/setting-mongo-repository' },
                  ],
                },
                {
                  text: 'Sqlite',
                  link: '/modules/settings/backend/repository/sqlite',
                  items: [
                    { text: 'SettingSqliteRepository', link: '/modules/settings/backend/repository/sqlite/setting-sqlite-repository' },
                  ],
                },
              ],
            },
            {
              text: 'Routes',
              link: '/modules/settings/backend/routes',
              items: [
                { text: 'SettingRoutes', link: '/modules/settings/backend/routes/setting-routes' },
              ],
            },
            {
              text: 'Schemas',
              link: '/modules/settings/backend/schemas',
              items: [
                { text: 'SettingSchema', link: '/modules/settings/backend/schemas/setting-schema' },
              ],
            },
            {
              text: 'Services',
              link: '/modules/settings/backend/services',
              items: [
                { text: 'SettingService', link: '/modules/settings/backend/services/setting-service' },
              ],
            },
          ],
        },
        {
          text: 'Frontend',
          link: '/modules/settings/frontend',
          items: [
            {
              text: 'Factory',
              link: '/modules/settings/frontend/factory',
              items: [
                { text: 'SettingProviderFactory', link: '/modules/settings/frontend/factory/setting-provider-factory' },
              ],
            },
            {
              text: 'i18n',
              link: '/modules/settings/frontend/i18n',
              items: [
                { text: 'SettingI18n', link: '/modules/settings/frontend/i18n/setting-i18n' },
                { text: 'SettingPermissionsI18n', link: '/modules/settings/frontend/i18n/setting-permissions-i18n' },
                { text: 'index', link: '/modules/settings/frontend/i18n/index-file' },
              ],
            },
            {
              text: 'Interfaces',
              link: '/modules/settings/frontend/interfaces',
              items: [
                { text: 'ISettingProvider', link: '/modules/settings/frontend/interfaces/i-setting-provider' },
              ],
            },
            {
              text: 'Providers',
              link: '/modules/settings/frontend/providers',
              items: [
                {
                  text: 'Gql',
                  link: '/modules/settings/frontend/providers/gql',
                  items: [
                    { text: 'SettingGqlProvider', link: '/modules/settings/frontend/providers/gql/setting-gql-provider' },
                  ],
                },
                {
                  text: 'Rest',
                  link: '/modules/settings/frontend/providers/rest',
                  items: [
                    { text: 'SettingRestProvider', link: '/modules/settings/frontend/providers/rest/setting-rest-provider' },
                  ],
                },
              ],
            },
          ],
        },
        {
          text: 'Share',
          link: '/modules/settings/share',
          items: [
            {
              text: 'Interfaces',
              link: '/modules/settings/share/interfaces',
              items: [
                { text: 'ISetting', link: '/modules/settings/share/interfaces/i-setting' },
              ],
            },
          ],
        },
        {
          text: 'Vue',
          link: '/modules/settings/vue',
          items: [
            {
              text: 'Components',
              link: '/modules/settings/vue/components',
              items: [
                { text: 'SettingAvConfig', link: '/modules/settings/vue/components/setting-av-config' },
                { text: 'SettingCardConfig', link: '/modules/settings/vue/components/setting-card-config' },
                { text: 'SettingEditor', link: '/modules/settings/vue/components/setting-editor' },
                { text: 'SettingField', link: '/modules/settings/vue/components/setting-field' },
                { text: 'SettingLoaded', link: '/modules/settings/vue/components/setting-loaded' },
                { text: 'SettingTableConfig', link: '/modules/settings/vue/components/setting-table-config' },
              ],
            },
            {
              text: 'Composables',
              link: '/modules/settings/vue/composables',
              items: [
                { text: 'useSetting', link: '/modules/settings/vue/composables/use-setting' },
              ],
            },
            {
              text: 'Pages',
              link: '/modules/settings/vue/pages',
              items: [
                { text: 'SettingAvPage', link: '/modules/settings/vue/pages/setting-av-page' },
                { text: 'SettingCardPage', link: '/modules/settings/vue/pages/setting-card-page' },
                { text: 'SettingPage', link: '/modules/settings/vue/pages/setting-page' },
              ],
            },
            {
              text: 'Routes',
              link: '/modules/settings/vue/routes',
              items: [
                { text: 'SettingRoutes', link: '/modules/settings/vue/routes/setting-routes' },
              ],
            },
            {
              text: 'Stores',
              link: '/modules/settings/vue/stores',
              items: [
                { text: 'useSettingStore', link: '/modules/settings/vue/stores/use-setting-store' },
              ],
            },
          ],
        },
      ],
      '/modules/email/': [
        { text: 'Email', link: '/modules/email/' },
        {
          text: 'Backend',
          link: '/modules/email/backend',
          items: [
            {
              text: 'Config',
              link: '/modules/email/backend/config',
              items: [
                { text: 'EmailLayoutConfig', link: '/modules/email/backend/config/email-layout-config' },
                { text: 'EmailTransportConfig', link: '/modules/email/backend/config/email-transport-config' },
              ],
            },
            {
              text: 'Factory',
              link: '/modules/email/backend/factory',
              items: [
                { text: 'EmailLayoutServiceFactory', link: '/modules/email/backend/factory/email-layout-service-factory' },
                { text: 'EmailTransportServiceFactory', link: '/modules/email/backend/factory/email-transport-service-factory' },
              ],
            },
            {
              text: 'Interfaces',
              link: '/modules/email/backend/interfaces',
              items: [
                { text: 'IEmailLayout', link: '/modules/email/backend/interfaces/i-email-layout' },
                { text: 'ITransportConfig', link: '/modules/email/backend/interfaces/i-transport-config' },
              ],
            },
            {
              text: 'Services',
              link: '/modules/email/backend/services',
              items: [
                { text: 'EmailLayoutService', link: '/modules/email/backend/services/email-layout-service' },
                { text: 'EmailTransportService', link: '/modules/email/backend/services/email-transport-service' },
              ],
            },
          ],
        },
      ],
      '/modules/arch/': [
        { text: 'Arch', link: '/modules/arch/' },
        {
          text: 'Generator',
          link: '/modules/arch/generator',
          items: [
            { text: 'ArchGenerator', link: '/modules/arch/generator/arch-generator' },
            {
              text: 'Helpers',
              link: '/modules/arch/generator/helpers',
              items: [
                { text: 'createDir', link: '/modules/arch/generator/helpers/create-dir' },
                { text: 'readFileContent', link: '/modules/arch/generator/helpers/read-file-content' },
                { text: 'writeFile', link: '/modules/arch/generator/helpers/write-file' },
              ],
            },
            {
              text: 'Templates',
              link: '/modules/arch/generator/templates',
              items: [
                { text: 'Template base', link: '/modules/arch/generator/templates/template' },
                {
                  text: 'Back',
                  link: '/modules/arch/generator/templates/back',
                  items: [
                    { text: 'EntityRepositoryInterface', link: '/modules/arch/generator/templates/back/entity-repository-interface' },
                    { text: 'FastifyController', link: '/modules/arch/generator/templates/back/fastify-controller' },
                    { text: 'MongoModel', link: '/modules/arch/generator/templates/back/mongo-model' },
                    { text: 'MongoRepository', link: '/modules/arch/generator/templates/back/mongo-repository' },
                    { text: 'Permissions', link: '/modules/arch/generator/templates/back/permissions' },
                    { text: 'Routes', link: '/modules/arch/generator/templates/back/routes' },
                    { text: 'Schema', link: '/modules/arch/generator/templates/back/schema' },
                    { text: 'Service', link: '/modules/arch/generator/templates/back/service' },
                    { text: 'ServiceFactory', link: '/modules/arch/generator/templates/back/service-factory' },
                    { text: 'SqliteRepository', link: '/modules/arch/generator/templates/back/sqlite-repository' },
                  ],
                },
                {
                  text: 'Front',
                  link: '/modules/arch/generator/templates/front',
                  items: [
                    { text: 'ComboboxComponent', link: '/modules/arch/generator/templates/front/combobox-component' },
                    { text: 'CrudComponent', link: '/modules/arch/generator/templates/front/crud-component' },
                    { text: 'CrudPage', link: '/modules/arch/generator/templates/front/crud-page' },
                    { text: 'CrudRoute', link: '/modules/arch/generator/templates/front/crud-route' },
                    { text: 'EntityCrud', link: '/modules/arch/generator/templates/front/entity-crud' },
                    { text: 'RestProvider', link: '/modules/arch/generator/templates/front/rest-provider' },
                    { text: 'RoutesIndex', link: '/modules/arch/generator/templates/front/routes-index' },
                    { text: 'i18n', link: '/modules/arch/generator/templates/front/i18n' },
                    { text: 'i18nIndex', link: '/modules/arch/generator/templates/front/i18n-index' },
                  ],
                },
                {
                  text: 'Share',
                  link: '/modules/arch/generator/templates/share',
                  items: [
                    { text: 'EntityInterface', link: '/modules/arch/generator/templates/share/entity-interface' },
                  ],
                },
              ],
            },
          ],
        },
        {
          text: 'Interfaces',
          link: '/modules/arch/interfaces',
          items: [
            { text: 'IEntitySchema', link: '/modules/arch/interfaces/i-entity-schema' },
          ],
        },
        {
          text: 'Schemas',
          link: '/modules/arch/schemas',
          items: [
            { text: 'AutoSchema', link: '/modules/arch/schemas/auto-schema' },
          ],
        },
      ],
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/draxjs/modules' },
    ],
  },
})
