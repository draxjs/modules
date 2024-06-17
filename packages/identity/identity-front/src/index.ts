import AuthSystem from "./system/AuthSystem.js"
import UserSystem from "./system/UserSystem.js"
import RoleSystem from "./system/RoleSystem.js"

import AuthRestProvider from "./providers/rest/AuthRestProvider.js";
import AuthGqlProvider from "./providers/gql/AuthGqlProvider.js";

import UserRestProvider from "./providers/rest/UserRestProvider.js";
import UserGqlProvider from "./providers/gql/UserGqlProvider.js";

import RoleRestProvider from "./providers/rest/RoleRestProvider.js";
import RoleGqlProvider from "./providers/gql/RoleGqlProvider.js";


import type {IAuthProvider} from "./interfaces/IAuthProvider"
import type {IUserProvider} from "./interfaces/IUserProvider"
import type {IRoleProvider} from "./interfaces/IRoleProvider"

import type {IAuthUser} from "./interfaces/IAuthUser"
import type {IUser} from "./interfaces/IUser"
import type {IRole} from "./interfaces/IRole"

import type {ILoginResponse} from "./interfaces/ILoginResponse"

export type {
    IAuthProvider,
    IUserProvider,
    IRoleProvider,
    IAuthUser,
    IUser,
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
    RoleSystem

}
