import AuthSystem from "./system/AuthSystem.js"
import UserSystem from "./system/UserSystem.js"
import RoleSystem from "./system/RoleSystem.js"
import {AuthHelper} from "./helpers/AuthHelper.js"
import {jwtDecodeHelper} from "./helpers/JwtDecodeHelper.js"

import AuthRestProvider from "./providers/rest/AuthRestProvider.js";
import AuthGqlProvider from "./providers/gql/AuthGqlProvider.js";

import UserRestProvider from "./providers/rest/UserRestProvider.js";
import UserGqlProvider from "./providers/gql/UserGqlProvider.js";

import RoleRestProvider from "./providers/rest/RoleRestProvider.js";
import RoleGqlProvider from "./providers/gql/RoleGqlProvider.js";

import {IdentityI18nMessages} from "./i18n/index.js"

import type {IAuthProvider} from "./interfaces/IAuthProvider"
import type {IUserProvider} from "./interfaces/IUserProvider"
import type {IRoleProvider} from "./interfaces/IRoleProvider"
import type {IAuthUser} from "./interfaces/IAuthUser"
import type {IUser, IUserCreate, IUserUpdate, IUserPassword} from "./interfaces/IUser"
import type {IRole} from "./interfaces/IRole"
import type {ILoginResponse} from "./interfaces/ILoginResponse"

export type {
    IAuthProvider,
    IUserProvider,
    IRoleProvider,
    IAuthUser,
    IUser,
    IUserCreate,
    IUserUpdate,
    IUserPassword,
    IRole,
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

    //Systems
    AuthSystem,
    UserSystem,
    RoleSystem,

    //Helpers
    AuthHelper,
    jwtDecodeHelper,

    //I18n
    IdentityI18nMessages

}
