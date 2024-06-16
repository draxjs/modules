import {UserCrudPage} from "@drax/identity-vue";
import HomePage from '../pages/home/index.vue'
import LoginPage from '../pages/user/login/index.vue'

const routes = [
  {
    name: 'Home',
    path: '/home',
    component: HomePage
  },
  {
    name: 'Login',
    path: '/login',
    component: LoginPage
  },
  {
    name: 'Info',
    path: '/info',
    children: [
      {
        name: 'InfoAbout',
        path: '/info/about',
        component: () => import('../pages/info/about/index.vue')
      },
      {
        name: 'InfoFaq',
        path: '/info/faq',
        component: () => import('../pages/info/faq/index.vue')
      }
    ]
  },
  {
    name: 'CrudUser',
    path: '/crud/user',
    component: UserCrudPage
  }
]


export default routes
