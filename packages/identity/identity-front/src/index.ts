import {AuthHelper} from "./helpers/AuthHelper.js"
import {jwtDecodeHelper} from "./helpers/JwtDecodeHelper.js"

import AuthRestProvider from "./providers/rest/AuthRestProvider.js";
import AuthGqlProvider from "./providers/gql/AuthGqlProvider.js";
import AuthSystem from "./system/AuthSystem.js"
import AuthSystemFactory from "./factory/AuthSystemFactory.js"

import UserRestProvider from "./providers/rest/UserRestProvider.js";
import UserGqlProvider from "./providers/gql/UserGqlProvider.js";
import UserSystem from "./system/UserSystem.js"
import UserSystemFactory from "./factory/UserSystemFactory.js"

import UserApiKeyRestProvider from "./providers/rest/UserApiKeyRestProvider.js";
import UserApiKeyGqlProvider from "./providers/gql/UserApiKeyGqlProvider.js";
import UserApiKeySystem from "./system/UserApiKeySystem.js"
import UserApiKeySystemFactory from "./factory/UserApiKeySystemFactory.js"



import RoleRestProvider from "./providers/rest/RoleRestProvider.js";
import RoleGqlProvider from "./providers/gql/RoleGqlProvider.js";
import RoleSystem from "./system/RoleSystem.js"
import RoleSystemFactory from "./factory/RoleSystemFactory.js"

import TenantRestProvider from "./providers/rest/TenantRestProvider.js";
import TenantGqlProvider from "./providers/gql/TenantGqlProvider.js";
import TenantSystem from "./system/TenantSystem.js"
import TenantSystemFactory from "./factory/TenantSystemFactory.js"


import UserSessionRestProvider from "./providers/rest/UserSessionRestProvider.js";
import UserSessionGqlProvider from "./providers/gql/UserSessionGqlProvider.js";
import UserSessionSystem from "./system/UserSessionSystem.js"
import UserSessionSystemFactory from "./factory/UserSessionSystemFactory.js"

import UserLoginFailRestProvider from "./providers/rest/UserLoginFailRestProvider.js";
import UserLoginFailGqlProvider from "./providers/gql/UserLoginFailGqlProvider.js";
import UserLoginFailSystem from "./system/UserLoginFailSystem.js"
import UserLoginFailSystemFactory from "./factory/UserLoginFailSystemFactory.js"


import {IdentityI18nMessages} from "./i18n/index.js"

import type {IAuthProvider} from "./interfaces/IAuthProvider"
import type {IUserProvider} from "./interfaces/IUserProvider"
import type {IRoleProvider} from "./interfaces/IRoleProvider"
import type {ITenantProvider} from "./interfaces/ITenantProvider"
import type {IUserApiKeyProvider} from "./interfaces/IUserApiKeyProvider"
import type {IAuthUser} from "./interfaces/IAuthUser"
import type {IUserPassword} from "./interfaces/IUserPassword"
import type {ILoginResponse} from "./interfaces/ILoginResponse"
import type {IUserRegistration} from "./interfaces/IUserRegistration"

export type {
    IAuthProvider,
    IUserProvider,
    IRoleProvider,
    ITenantProvider,
    IUserApiKeyProvider,
    IAuthUser,
    IUserPassword,
    ILoginResponse,
    IUserRegistration
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

    UserSessionRestProvider,
    UserSessionGqlProvider,

    UserLoginFailRestProvider,
    UserLoginFailGqlProvider,


    //Systems
    AuthSystem,
    UserSystem,
    RoleSystem,
    TenantSystem,
    UserApiKeySystem,
    UserSessionSystem,
    UserLoginFailSystem,

    //Factory
    AuthSystemFactory,
    UserSystemFactory,
    RoleSystemFactory,
    TenantSystemFactory,
    UserApiKeySystemFactory,
    UserSessionSystemFactory,
    UserLoginFailSystemFactory,

    //Helpers
    AuthHelper,
    jwtDecodeHelper,

    //I18n
    IdentityI18nMessages

}
