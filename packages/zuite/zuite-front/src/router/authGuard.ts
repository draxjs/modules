import type {NavigationGuard} from 'vue-router'
import {isRememberMeEnabled, refreshAuthSession, useAuth, useAuthStore} from '@drax/identity-vue'

export const authGuard: NavigationGuard = async (to) => {
  const {isAuthenticated, hasPermission} = useAuth()
  try {
    await refreshAuthSession()
  } catch {
    // Rejected credentials are cleared by session maintenance; transient errors retain them.
  }
  // A valid JWT with a temporarily unavailable profile is also recoverable.
  if (isRememberMeEnabled() && (to.meta.auth || to.meta.permission) && !isAuthenticated() && useAuthStore().refreshToken) {
    return false
  }
  if ((to.name !== 'Login' && to.meta.auth && !isAuthenticated()) ||
      (to.meta.permission && !hasPermission(to.meta.permission as string))) {
    return {path: '/login', query: {redirect: to.fullPath}}
  }
}
