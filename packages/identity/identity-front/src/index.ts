import IdentityLogin from "./components/IdentityLogin/IdentityLogin.vue";
import AuthSystem from "./core/system/AuthSystem.js"
import AuthRestProvider from "./core/providers/rest/AuthRestProvider.js";
import AuthGqlProvider from "./core/providers/gql/AuthGqlProvider.js";
import {useAuthStore} from "./stores/auth/AuthStore.js";

import type {IAuthProvider} from "./core/interfaces/IAuthProvider"

export type {
    IAuthProvider
}

export {
    //Vue Components
    IdentityLogin,

    //Providers
    AuthRestProvider,
    AuthGqlProvider,

    //Systems
    AuthSystem,

    //Stores
    useAuthStore
}
