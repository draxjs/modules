import LoginPage from '../pages/LoginPage.vue'
import UserCrudPage from '../pages/UserCrudPage.vue'
import RoleCrudPage from '../pages/RoleCrudPage.vue'
import TenantCrudPage from '../pages/TenantCrudPage.vue'

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

]


export default routes
