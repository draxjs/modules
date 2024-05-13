// Utilities
import { defineStore } from 'pinia'
import AuthSystem from "../../core/system/AuthSystem";

export const useAuthStore = defineStore('AuthStore', {
  state: () => ({
    authSystem : AuthSystem
  }),
  actions:{
    setAuthSystem(authSystem:AuthSystem){
      this.authSystem = authSystem
    }
  },
  getters:{
    getAuthSystem: (state) => {
      return state.authSystem
    }
  }
})
