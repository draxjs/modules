import LoginPage from '../pages/LoginPage.vue'
import ProfilePage from '../pages/ProfilePage.vue'
import PasswordPage from '../pages/PasswordPage.vue'
import UserCrudPage from '../pages/UserCrudPage.vue'
import UserCrudCustomPage from '../pages/UserCrudCustomPage.vue'
import RoleCrudPage from '../pages/RoleCrudPage.vue'
import RoleCrudCustomPage from '../pages/RoleCrudCustomPage.vue'
import TenantCrudPage from '../pages/TenantCrudPage.vue'
import TenantCrudCustomPage from '../pages/TenantCrudCustomPage.vue'
import UserApiKeyCrudPage from '../pages/UserApiKeyCrudPage.vue'

const routes = [
    {
        name: 'Login',
        path: '/login',
        component: LoginPage,
        meta: {
            auth: false,
        }
    },
    {
        name: 'Profile',
        path: '/profile',
        component: ProfilePage,
        meta: {
            auth: true,
        }
    },
    {
        name: 'Password',
        path: '/password',
        component: PasswordPage,
        meta: {
            auth: true,
        }
    },
    //CRUDS
    {
        name: 'CrudRole',
        path: '/crud/role',
        component: RoleCrudPage,
        meta: {
            auth: true,
            permission: 'role:manage'
        }
    },

    {
        name: 'CrudTenant',
        path: '/crud/tenant',
        component: TenantCrudPage,
        meta: {
            auth: true,
            permission: 'tenant:manage'
        }
    },

    {
        name: 'CrudUser',
        path: '/crud/user',
        component: UserCrudPage,
        meta: {
            auth: true,
            permission: 'user:manage'
        }
    },
    {
        name: 'CrudUserApiKey',
        path: '/crud/user-api-key',
        component: UserApiKeyCrudPage,
        meta: {
            auth: true,
            permission: 'userApiKey:manage'
        }
    },

    //CUSTOM CRUDs
    {
        name: 'CrudCustomTenant',
        path: '/crud/custom/tenant',
        component: TenantCrudCustomPage,
        meta: {
            auth: true,
            permission: 'tenant:manage'
        }
    },
    {
        name: 'CrudRoleCustom',
        path: '/crud/custom/role',
        component: RoleCrudCustomPage,
        meta: {
            auth: true,
            permission: 'role:manage'
        }
    },
    {
        name: 'CrudCustomUser',
        path: '/crud/custom/user',
        component: UserCrudCustomPage,
        meta: {
            auth: true,
            permission: 'user:manage'
        }
    },

]


export default routes
