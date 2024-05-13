// Utilities
import { defineStore } from 'pinia'
import AuthSystem from "../../core/system/AuthSystem.js";

export const useAuthStore = defineStore('AuthStore', {
  state: () => ({
    authSystem : null as AuthSystem | null
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
