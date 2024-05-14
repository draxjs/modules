// Utilities
import { defineStore } from 'pinia'
import AuthSystem from "../../core/system/AuthSystem.js";
import type {IAuthUser} from "@/core/interfaces/IAuthUser";

export const useAuthStore = defineStore('AuthStore', {
  state: () => ({
    accessToken: null as string | null,
    authUser: null as IAuthUser | null,
    authSystem : null as AuthSystem | null
  }),
  actions:{
    setAuthSystem(authSystem:AuthSystem){
      this.authSystem = authSystem
    },
    setAccessToken(accessToken:string){
      this.accessToken = accessToken
    },
    setAuthUser(authUser:IAuthUser){
      this.authUser = authUser
    },
    logout(){
      this.accessToken = null
      this.authUser = null
    }
  },
  getters:{
    getAuthSystem: (state) : AuthSystem | null => {
      return state.authSystem
    },
    getAuthUser: (state) => {
      return state.authUser
    },
  },
  persist: true
})
