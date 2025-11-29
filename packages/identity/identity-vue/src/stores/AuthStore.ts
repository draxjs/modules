// Utilities
import { defineStore } from 'pinia'
import type {IAuthFullUser} from "@drax/identity-front";
//@ts-ignore
import type from 'pinia-plugin-persistedstate'
import {AuthHelper} from "@drax/identity-front";

export const useAuthStore = defineStore('AuthStore', {
  state: () => ({
    accessToken: null as string | null,
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
    setAccessToken(accessToken:string){
      this.accessToken = accessToken
    },
    setAuthUser(authUser:IAuthFullUser){
      this.authUser = authUser
    },
    clearAuth(){
      this.accessToken = null
      this.authUser = null
    }
  },

  persist: true
})
