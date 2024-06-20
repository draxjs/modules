import IdentityLogin from "./components/IdentityLogin/IdentityLogin.vue";
import IdentityProfileAvatar from "./components/IdentityProfileAvatar/IdentityProfileAvatar.vue";
import IdentityProfileDrawer from "./components/IdentityProfileDrawer/IdentityProfileDrawer.vue";
import IdentityProfileView from "./components/IdentityProfileView/IdentityProfileView.vue";
import UserCrud from "./cruds/user-crud/UserCrud.vue";
import UserList from "./cruds/user-crud/UserList.vue";
import UserCrudPage from "./pages/UserCrudPage.vue";
import UserCreateForm from "./forms/UserCreateForm.vue";
import UserEditForm from "./forms/UserEditForm.vue";
import RoleForm from "./forms/RoleForm.vue";

import RoleCrud from "./cruds/role-crud/RoleCrud.vue";
import RoleList from "./cruds/role-crud/RoleList.vue";
import RoleCrudPage from "./pages/RoleCrudPage.vue";

import {useAuth} from "./composables/useAuth.js";
import {useUser} from "./composables/useUser.js";
import {useRole} from "./composables/useRole.js";
import {useAuthStore} from "./stores/auth/AuthStore.js";

export {
    //Vue Components
    IdentityLogin,
    IdentityProfileAvatar,
    IdentityProfileView,
    IdentityProfileDrawer,

    //Forms
    UserCreateForm,
    UserEditForm,
    RoleForm,

    //Vue Composables
    useAuth,
    useUser,
    useRole,

    //Cruds
    UserCrud,
    UserList,

    RoleCrud,
    RoleList,

    //Pages
    UserCrudPage,
    RoleCrudPage,

    //Stores
    useAuthStore
}
