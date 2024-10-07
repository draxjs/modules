import {AuthHelper} from "./helpers/AuthHelper.js"
import {jwtDecodeHelper} from "./helpers/JwtDecodeHelper.js"

import AuthRestProvider from "./providers/rest/AuthRestProvider.js";
import AuthGqlProvider from "./providers/gql/AuthGqlProvider.js";
import AuthSystem from "./system/AuthSystem.js"


import UserRestProvider from "./providers/rest/UserRestProvider.js";
import UserGqlProvider from "./providers/gql/UserGqlProvider.js";
import UserSystem from "./system/UserSystem.js"

import UserApiKeyRestProvider from "./providers/rest/UserApiKeyRestProvider.js";
import UserApiKeyGqlProvider from "./providers/gql/UserApiKeyGqlProvider.js";
import UserApiKeySystem from "./system/UserApiKeySystem.js"



import RoleRestProvider from "./providers/rest/RoleRestProvider.js";
import RoleGqlProvider from "./providers/gql/RoleGqlProvider.js";
import RoleSystem from "./system/RoleSystem.js"


import TenantRestProvider from "./providers/rest/TenantRestProvider.js";
import TenantGqlProvider from "./providers/gql/TenantGqlProvider.js";
import TenantSystem from "./system/TenantSystem.js"
import TenantSystemFactory from "./factory/TenantSystemFactory.js"


import {IdentityI18nMessages} from "./i18n/index.js"

import type {IAuthProvider} from "./interfaces/IAuthProvider"
import type {IUserProvider} from "./interfaces/IUserProvider"
import type {IRoleProvider} from "./interfaces/IRoleProvider"
import type {ITenantProvider} from "./interfaces/ITenantProvider"
import type {IUserApiKeyProvider} from "./interfaces/IUserApiKeyProvider"
import type {IAuthUser} from "./interfaces/IAuthUser"
import type {IUserPassword} from "./interfaces/IUserPassword"
import type {ILoginResponse} from "./interfaces/ILoginResponse"

export type {
    IAuthProvider,
    IUserProvider,
    IRoleProvider,
    ITenantProvider,
    IUserApiKeyProvider,
    IAuthUser,
    IUserPassword,
    ILoginResponse
}

export {
    //Providers
    AuthRestProvider,
    AuthGqlProvider,

    UserGqlProvider,
    UserRestProvider,

    RoleGqlProvider,
    RoleRestProvider,

    TenantGqlProvider,
    TenantRestProvider,


    UserApiKeyRestProvider,
    UserApiKeyGqlProvider,

    //Systems
    AuthSystem,
    UserSystem,
    RoleSystem,
    TenantSystem,
    UserApiKeySystem,

    //Factory
    TenantSystemFactory,

    //Helpers
    AuthHelper,
    jwtDecodeHelper,

    //I18n
    IdentityI18nMessages

}
