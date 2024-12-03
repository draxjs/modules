/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import {createRouter, createWebHistory} from 'vue-router'
import {setupLayouts} from 'virtual:generated-layouts'
import iroutes from './routes'
import baseRoutes from '../modules/base/routes/index'
import peopleRoutes from '../modules/people/routes/index'
import {IdentityRoutes} from "@drax/identity-vue";

const routes = setupLayouts([
  ...iroutes,
  ...IdentityRoutes,
  ...baseRoutes,
  ...peopleRoutes
])

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,

})

import {useAuth} from "@drax/identity-vue";



router.beforeEach((to, from) => {

  const {isAuthenticated, hasPermission} = useAuth()
  if ( !['Login'].includes(to.name as string) && (to.meta.auth && !isAuthenticated()) || (to.meta.permission && !hasPermission(to.meta.permission as string))) {
    return {path: '/login', query: {redirect: to.fullPath}}
  }
})

export default router
