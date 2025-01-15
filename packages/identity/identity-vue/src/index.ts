import IdentityLogin from "./components/IdentityLogin/IdentityLogin.vue";
import IdentityProfileAvatar from "./components/IdentityProfileAvatar/IdentityProfileAvatar.vue";
import IdentityProfileDrawer from "./components/IdentityProfileDrawer/IdentityProfileDrawer.vue";
import IdentityProfileView from "./components/IdentityProfileView/IdentityProfileView.vue";

import UserCrudPage from "./pages/crud/UserCrudPage.vue";
import UserForm from "./cruds/user-crud/UserForm.vue";
import UserView from "./views/UserView.vue";

import RoleForm from "./cruds/role-crud/RoleForm.vue";
import RoleView from "./views/RoleView.vue";
import RoleCrudPage from "./pages/crud/RoleCrudPage.vue";

import LoginPage from "./pages/LoginPage.vue";
import ProfilePage from "./pages/ProfilePage.vue";
import PasswordPage from "./pages/PasswordChangePage.vue";

import TenantView from "./views/TenantView.vue";
import TenantCrudPage from "./pages/crud/TenantCrudPage.vue";


import UserApiKeyForm from "./forms/UserApiKeyForm.vue";
import UserApiKeyView from "./views/UserApiKeyView.vue";
import UserApiKeyCrud from "./cruds/user-api-key-crud/UserApiKeyCrud.vue";
import UserApiKeyList from "./cruds/user-api-key-crud/UserApiKeyList.vue";
import UserApiKeyCrudPage from "./pages/crud/UserApiKeyCrudPage.vue";

import {useAuth} from "./composables/useAuth.js";
import {useUser} from "./composables/useUser.js";
import {useRole} from "./composables/useRole.js";
import {useTenant} from "./composables/useTenant.js";
import {useUserApiKey} from "./composables/useUserApiKey.js";

import TenantCrud from "./cruds/tenant-crud/TenantCrud"
import UserCrud from "./cruds/user-crud/UserCrud"
import RoleCrud from "./cruds/role-crud/RoleCrud"



import {useAuthStore} from "./stores/auth/AuthStore.js";

import IdentityAuthRoutes from "./routes/IdentityAuthRoutes.js";
import IdentityCrudRoutes from "./routes/IdentityCrudRoutes.js";
import IdentityRoutes from "./routes/IdentityRoutes.js";

export {

    //Cruds
    TenantCrud,
    UserCrud,
    RoleCrud,

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
    UserForm,
    UserCrudPage,
    useAuth,
    useUser,

    //Role
    RoleView,
    RoleForm,
    RoleCrudPage,
    useRole,

    //Tenant
    TenantView,
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
    IdentityCrudRoutes,
    IdentityAuthRoutes,
    IdentityRoutes,
}
