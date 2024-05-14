import IdentityLogin from "./components/IdentityLogin/IdentityLogin.vue";
import IdentityProfileAvatar from "./components/IdentityProfileAvatar/IdentityProfileAvatar.vue";
import IdentityProfileDrawer from "./components/IdentityProfileDrawer/IdentityProfileDrawer.vue";
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
    IdentityProfileAvatar,
    IdentityProfileDrawer,

    //Providers
    AuthRestProvider,
    AuthGqlProvider,

    //Systems
    AuthSystem,

    //Stores
    useAuthStore
}
