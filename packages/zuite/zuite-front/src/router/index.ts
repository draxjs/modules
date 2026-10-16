
import {createRouter, createWebHistory} from 'vue-router'
import {setupLayouts} from 'virtual:generated-layouts'
import iroutes from './routes'
import {authGuard} from './authGuard'


const routes = setupLayouts([
  ...iroutes,
])

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,

})

router.beforeEach(authGuard)

export default router
