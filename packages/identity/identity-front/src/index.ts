import IdentityLogin from "./components/IdentityLogin/IdentityLogin.vue";
import IdentityProfileAvatar from "./components/IdentityProfileAvatar/IdentityProfileAvatar.vue";
import IdentityProfileDrawer from "./components/IdentityProfileDrawer/IdentityProfileDrawer.vue";
import IdentityProfileView from "./components/IdentityProfileView/IdentityProfileView.vue";
import UserCrud from "./cruds/user-crud/UserCrud.vue";
import UserList from "./cruds/user-crud/UserList.vue";
import UserCrudPage from "./pages/UserCrudPage.vue";
import AuthSystem from "./core/system/AuthSystem.js"
import UserSystem from "./core/system/UserSystem.js"
import AuthRestProvider from "./core/providers/rest/AuthRestProvider.js";
import AuthGqlProvider from "./core/providers/gql/AuthGqlProvider.js";

import UserRestProvider from "./core/providers/rest/UserRestProvider.js";
import UserGqlProvider from "./core/providers/gql/UserGqlProvider.js";

import {useAuthStore} from "./stores/auth/AuthStore.js";

import type {IAuthProvider} from "./core/interfaces/IAuthProvider"
import type {IUserProvider} from "./core/interfaces/IUserProvider"

export type {
    IAuthProvider,
    IUserProvider
}

export {
    //Vue Components
    IdentityLogin,
    IdentityProfileAvatar,
    IdentityProfileView,
    IdentityProfileDrawer,

    //Cruds
    UserCrud,
    UserList,

    //Pages
    UserCrudPage,

    //Providers
    AuthRestProvider,
    AuthGqlProvider,

    UserGqlProvider,
    UserRestProvider,

    //Systems
    AuthSystem,
    UserSystem,

    //Stores
    useAuthStore
}
