// Utilities
import { defineStore } from 'pinia'
import type {IAuthFullUser} from "@drax/identity-front";
//@ts-ignore
import type from 'pinia-plugin-persistedstate'
import {AuthHelper} from "@drax/identity-front";

export const useAuthStore = defineStore('AuthStore', {
  state: () => ({
    accessToken: null as string | null,
    sessionVersion: null as string | null,
    refreshToken: null as string | null,
    refreshExpiresAt: null as string | null,
    authUser: null as IAuthFullUser | null,
  }),
  getters:{
    isAuth: (state): boolean => {
      //TODO verify token
      return !!state.accessToken
    },
    hasPermission: (state) => (permission:string) => {
      return state.authUser && state.authUser.role && state.authUser.role.permissions ? state.authUser.role.permissions.includes(permission) : false
    },
    tokenIsValid: (state) => () => {
      return state.accessToken ? AuthHelper.isJWTValid(state.accessToken) : false
    },
  },
  actions:{
    persistSession(){
      // Persist synchronously so another tab holding the refresh lock sees rotation immediately.
      try {
        localStorage.setItem('AuthStore', JSON.stringify(this.$state))
      } catch { /* Storage may be unavailable (private mode / quota). */ }
    },
    setAccessToken(accessToken:string){
      this.$patch({accessToken, refreshToken: null, refreshExpiresAt: null})
      this.persistSession()
    },
    setSession(session: {accessToken: string, refreshToken?: string, refreshExpiresAt?: string}){
      this.$patch({
        accessToken: session.accessToken,
        refreshToken: session.refreshToken ?? null,
        refreshExpiresAt: session.refreshExpiresAt ?? null,
      })
      this.persistSession()
    },
    setAuthUser(authUser:IAuthFullUser){
      this.authUser = authUser
      this.persistSession()
    },
    clearAuth(){
      this.$patch({
        accessToken: null, refreshToken: null, refreshExpiresAt: null, authUser: null,
        // A persisted epoch also invalidates pending work in other tabs, even null -> null.
        sessionVersion: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
      })
      this.persistSession()
    }
  },

  persist: true
})
