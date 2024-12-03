import HomePage from '../pages/home/index.vue'

const routes = [
  {
    name: 'Root',
    path: '/',
    component: HomePage,
    meta: {
      auth: true,
    }
  },
  {
    name: 'Home',
    path: '/home',
    component: HomePage,
    meta: {
      auth: true,
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
