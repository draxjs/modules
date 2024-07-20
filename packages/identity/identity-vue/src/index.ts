import IdentityLogin from "./components/IdentityLogin/IdentityLogin.vue";
import IdentityProfileAvatar from "./components/IdentityProfileAvatar/IdentityProfileAvatar.vue";
import IdentityProfileDrawer from "./components/IdentityProfileDrawer/IdentityProfileDrawer.vue";
import IdentityProfileView from "./components/IdentityProfileView/IdentityProfileView.vue";

import UserCrud from "./cruds/user-crud/UserCrud.vue";
import UserList from "./cruds/user-crud/UserList.vue";
import UserCrudPage from "./pages/UserCrudPage.vue";
import UserCreateForm from "./forms/UserCreateForm.vue";
import UserEditForm from "./forms/UserEditForm.vue";
import UserView from "./views/UserView.vue";

import RoleForm from "./forms/RoleForm.vue";
import RoleView from "./views/RoleView.vue";
import RoleCrud from "./cruds/role-crud/RoleCrud.vue";
import RoleList from "./cruds/role-crud/RoleList.vue";
import RoleCrudPage from "./pages/RoleCrudPage.vue";

import LoginPage from "./pages/LoginPage.vue";
import ProfilePage from "./pages/ProfilePage.vue";
import PasswordPage from "./pages/PasswordPage.vue";


import TenantForm from "./forms/TenantForm.vue";
import TenantView from "./views/TenantView.vue";
import TenantCrud from "./cruds/tenant-crud/TenantCrud.vue";
import TenantList from "./cruds/tenant-crud/TenantList.vue";
import TenantCrudPage from "./pages/TenantCrudPage.vue";


import UserApiKeyForm from "./forms/UserApiKeyForm.vue";
import UserApiKeyView from "./views/UserApiKeyView.vue";
import UserApiKeyCrud from "./cruds/user-api-key-crud/UserApiKeyCrud.vue";
import UserApiKeyList from "./cruds/user-api-key-crud/UserApiKeyList.vue";
import UserApiKeyCrudPage from "./pages/UserApiKeyCrudPage.vue";

import {useAuth} from "./composables/useAuth.js";
import {useUser} from "./composables/useUser.js";
import {useRole} from "./composables/useRole.js";
import {useTenant} from "./composables/useTenant.js";
import {useUserApiKey} from "./composables/useUserApiKey.js";


import {useAuthStore} from "./stores/auth/AuthStore.js";

import IdentityRoutes from "./routes/IdentityRoutes.js";

export {

    //Vue Components
    IdentityLogin,
    IdentityProfileAvatar,
    IdentityProfileView,
    IdentityProfileDrawer,

    //Pages
    LoginPage,
    ProfilePage,
    PasswordPage,

    //User
    UserView,
    UserCreateForm,
    UserEditForm,
    UserCrud,
    UserList,
    UserCrudPage,
    useAuth,
    useUser,

    //Role
    RoleView,
    RoleForm,
    RoleCrud,
    RoleList,
    RoleCrudPage,
    useRole,

    //Tenant
    TenantView,
    TenantForm,
    TenantCrud,
    TenantList,
    TenantCrudPage,
    useTenant,


    //UserApiKey
    UserApiKeyView,
    UserApiKeyForm,
    UserApiKeyCrud,
    UserApiKeyList,
    UserApiKeyCrudPage,
    useUserApiKey,

    //Stores
    useAuthStore,

    //Routes
    IdentityRoutes
}
