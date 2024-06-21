import {UserCrudPage, RoleCrudPage} from "@drax/identity-vue";
import HomePage from '../pages/home/index.vue'
import LoginPage from '../pages/user/login/index.vue'

const routes = [
  {
    name: 'Root',
    path: '/',
    component: HomePage,
    meta: {
      auth: false,
    }
  },
  {
    name: 'Home',
    path: '/home',
    component: HomePage,
    meta: {
      auth: false,
    }
  },
  {
    name: 'Login',
    path: '/login',
    component: LoginPage,
    meta: {
      auth: false,
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
    name: 'CrudRole',
    path: '/crud/role',
    component: RoleCrudPage,
    meta: {
      auth: true,
      permission: 'role:manage'
    }
  },

  {
    name: 'InfoAbout',
    path: '/info/about',
    component: () => import('../pages/info/about/index.vue'),
    meta: {
      auth: true,
    }
  },
  {
    name: 'InfoFaq',
    path: '/info/faq',
    component: () => import('../pages/info/faq/index.vue'),
    meta: {
      auth: false,
    },

  }
]


export default routes
