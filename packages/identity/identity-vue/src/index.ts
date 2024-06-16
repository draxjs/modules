import IdentityLogin from "./components/IdentityLogin/IdentityLogin.vue";
import IdentityProfileAvatar from "./components/IdentityProfileAvatar/IdentityProfileAvatar.vue";
import IdentityProfileDrawer from "./components/IdentityProfileDrawer/IdentityProfileDrawer.vue";
import IdentityProfileView from "./components/IdentityProfileView/IdentityProfileView.vue";
import UserCrud from "./cruds/user-crud/UserCrud.vue";
import UserList from "./cruds/user-crud/UserList.vue";
import UserCrudPage from "./pages/UserCrudPage.vue";

import {useAuthStore} from "./stores/auth/AuthStore.js";

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

    //Stores
    useAuthStore
}
