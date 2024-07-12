import LoginPage from '../pages/LoginPage.vue'
import ProfilePage from '../pages/ProfilePage.vue'
import PasswordPage from '../pages/PasswordPage.vue'
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
