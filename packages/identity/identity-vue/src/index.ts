import IdentityLogin from "./components/IdentityLogin/IdentityLogin.vue";
import IdentityProfileAvatar from "./components/IdentityProfileAvatar/IdentityProfileAvatar.vue";
import IdentityProfileDrawer from "./components/IdentityProfileDrawer/IdentityProfileDrawer.vue";
import IdentityProfileView from "./components/IdentityProfileView/IdentityProfileView.vue";
import IdentityProfileAvatarEdit from "./components/IdentityProfileAvatarEdit/IdentityProfileAvatarEdit.vue";
import SwitchTenant from "./components/SwitchTenant/SwitchTenant.vue";

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


import UserApiKeyForm from "./cruds/user-api-key-crud/UserApiKeyForm.vue";
import UserApiKeyCreated from "./cruds/user-api-key-crud/UserApiKeyCreated.vue";
import UserApiKeyView from "./views/UserApiKeyView.vue";
import UserApiKeyCrudPage from "./pages/crud/UserApiKeyCrudPage.vue";


import UserLoginFailCrudPage from "./pages/crud/UserLoginFailCrudPage.vue";
import UserSessionCrudPage from "./pages/crud/UserSessionCrudPage.vue";

import {useAuth} from "./composables/useAuth.js";
import {useUser} from "./composables/useUser.js";
import {useRole} from "./composables/useRole.js";
import {useTenant} from "./composables/useTenant.js";
import {useUserApiKey} from "./composables/useUserApiKey.js";

import TenantCrud from "./cruds/tenant-crud/TenantCrud"
import UserCrud from "./cruds/user-crud/UserCrud"
import RoleCrud from "./cruds/role-crud/RoleCrud"



import {useAuthStore} from "./stores/AuthStore.js";
import {useIdentityCrudStore} from "./stores/IdentityCrudStore.js";

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
    IdentityProfileAvatarEdit,
    SwitchTenant,

    //Pages
    LoginPage,
    ProfilePage,
    PasswordPage,

    UserLoginFailCrudPage,
    UserSessionCrudPage,

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
    UserApiKeyCreated,
    UserApiKeyCrudPage,
    useUserApiKey,

    //Stores
    useAuthStore,
    useIdentityCrudStore,

    //Routes
    IdentityCrudRoutes,
    IdentityAuthRoutes,
    IdentityRoutes,
}
