/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import {createRouter, createWebHistory} from 'vue-router'
import {setupLayouts} from 'virtual:generated-layouts'
import iroutes from './routes'
import peopleRoutes from '../modules/people/routes'
import {IdentityRoutes} from "@drax/identity-vue";

const routes = setupLayouts([...iroutes,...IdentityRoutes, ...peopleRoutes])

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,

})

import {useAuth} from "@drax/identity-vue";



router.beforeEach((to, from) => {

  const {isAuthenticated, hasPermission} = useAuth()
  if (to.name == 'Login') {
    return true
  }else if ((to.meta.auth && !isAuthenticated()) || (to.meta.permission && !hasPermission(to.meta.permission as string))) {
    return {path: '/login', query: {redirect: to.fullPath}}
  }
  return true
})

export default router
