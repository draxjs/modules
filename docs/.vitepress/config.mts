import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Drax Docs',
  description: 'Documentación de Drax',
  base: '/modules/',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Common', link: '/modules/common/' },
      { text: 'Identity', link: '/modules/identity/' },
      { text: 'Crud', link: '/modules/crud/' },
    ],
    sidebar: {
      '/modules/common/': [
        { text: 'Common', link: '/modules/common/' },
        {
          text: 'Backend',
          link: '/modules/common/backend',
          items: [
            { text: 'Cache', link: '/modules/common/backend/cache' },
            { text: 'Config', link: '/modules/common/backend/config' },
            { text: 'Constants', link: '/modules/common/backend/constants' },
            { text: 'Controllers', link: '/modules/common/backend/controllers' },
            { text: 'Errors', link: '/modules/common/backend/errors' },
            { text: 'GraphQL', link: '/modules/common/backend/graphql' },
            { text: 'Interfaces', link: '/modules/common/backend/interfaces' },
            { text: 'Mongoose', link: '/modules/common/backend/mongoose' },
            { text: 'Setup', link: '/modules/common/backend/setup' },
            { text: 'SQL', link: '/modules/common/backend/sql' },
            { text: 'SQLite', link: '/modules/common/backend/sqlite' },
            { text: 'Store', link: '/modules/common/backend/store' },
            { text: 'Utils', link: '/modules/common/backend/utils' },
          ],
        },
        {
          text: 'Frontend',
          link: '/modules/common/frontend',
          items: [
            { text: 'Clients', link: '/modules/common/frontend/clients' },
            { text: 'Errors', link: '/modules/common/frontend/errors' },
            { text: 'Factories', link: '/modules/common/frontend/factories' },
            { text: 'Helpers', link: '/modules/common/frontend/helpers' },
            { text: 'i18n', link: '/modules/common/frontend/i18n' },
            { text: 'Interfaces', link: '/modules/common/frontend/interfaces' },
          ],
        },
        {
          text: 'Share',
          link: '/modules/common/share',
          items: [{ text: 'Interfaces', link: '/modules/common/share/interfaces' }],
        },
        {
          text: 'Vue',
          link: '/modules/common/vue',
          items: [
            { text: 'Components', link: '/modules/common/vue/components' },
            { text: 'Composables', link: '/modules/common/vue/composables' },
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
            { text: 'Errors', link: '/modules/identity/frontend/errors' },
            { text: 'Factory', link: '/modules/identity/frontend/factory' },
            { text: 'Helpers', link: '/modules/identity/frontend/helpers' },
            { text: 'i18n', link: '/modules/identity/frontend/i18n' },
            { text: 'Interfaces', link: '/modules/identity/frontend/interfaces' },
            { text: 'Providers', link: '/modules/identity/frontend/providers' },
            { text: 'System', link: '/modules/identity/frontend/system' },
          ],
        },
        {
          text: 'Share',
          link: '/modules/identity/share',
          items: [{ text: 'Interfaces', link: '/modules/identity/share/interfaces' }],
        },
        {
          text: 'Vue',
          link: '/modules/identity/vue',
          items: [
            { text: 'Assets', link: '/modules/identity/vue/assets' },
            { text: 'Combobox', link: '/modules/identity/vue/combobox' },
            { text: 'Components', link: '/modules/identity/vue/components' },
            { text: 'Composables', link: '/modules/identity/vue/composables' },
            { text: 'Cruds', link: '/modules/identity/vue/cruds' },
            { text: 'i18n', link: '/modules/identity/vue/i18n' },
            { text: 'Icons', link: '/modules/identity/vue/icons' },
            { text: 'Pages', link: '/modules/identity/vue/pages' },
            { text: 'Routes', link: '/modules/identity/vue/routes' },
            { text: 'Stores', link: '/modules/identity/vue/stores' },
            { text: 'Views', link: '/modules/identity/vue/views' },
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
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/draxjs/modules' },
    ],
  },
})
