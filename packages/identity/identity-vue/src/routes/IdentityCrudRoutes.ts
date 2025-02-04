import UserCrudPage from '../pages/crud/UserCrudPage.vue'
import RoleCrudPage from '../pages/crud/RoleCrudPage.vue'
import TenantCrudPage from '../pages/crud/TenantCrudPage.vue'
import UserApiKeyCrudPage from '../pages/crud/UserApiKeyCrudPage.vue'

const routes = [

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



]


export default routes
