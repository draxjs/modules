import AuthSystem from "./core/system/AuthSystem.js"
import UserSystem from "./core/system/UserSystem.js"
import AuthRestProvider from "./core/providers/rest/AuthRestProvider.js";
import AuthGqlProvider from "./core/providers/gql/AuthGqlProvider.js";

import UserRestProvider from "./core/providers/rest/UserRestProvider.js";
import UserGqlProvider from "./core/providers/gql/UserGqlProvider.js";


import type {IAuthProvider} from "./core/interfaces/IAuthProvider"
import type {IUserProvider} from "./core/interfaces/IUserProvider"
import type {IAuthUser} from "./core/interfaces/IAuthUser"
import type {IAuthRole} from "./core/interfaces/IAuthRole"
import type {ILoginResponse} from "./core/interfaces/ILoginResponse"

export type {
    IAuthProvider,
    IUserProvider,
    IAuthUser,
    IAuthRole,
    ILoginResponse
}

export {
    //Providers
    AuthRestProvider,
    AuthGqlProvider,

    UserGqlProvider,
    UserRestProvider,

    //Systems
    AuthSystem,
    UserSystem,

}
