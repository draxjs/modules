// Utilities
import { defineStore } from 'pinia'
import type {IAuthUser} from "@drax/identity-front";
import type from 'pinia-plugin-persistedstate'

export const useAuthStore = defineStore('AuthStore', {
  state: () => ({
    accessToken: null as string | null,
    authUser: null as IAuthUser | null,
    authError : '' as string
  }),
  getters:{
    me: (state): IAuthUser | null => {
      return state.authUser
    },
    isAuth: (state): boolean => {
      //TODO verify token
      return !!state.accessToken
    }
  },
  actions:{
    setAccessToken(accessToken:string){
      this.accessToken = accessToken
    },
    setAuthUser(authUser:IAuthUser){
      this.authUser = authUser
    },
    clearAuth(){
      this.accessToken = null
      this.authUser = null
      this.authError = ''
    }
  },

  persist: true
})
