import { defineStore } from 'pinia'
import vuetify from '../../plugins/vuetify.js'

export const useVuetifyStore = defineStore('VuetifyStore', {
  state: () => (
    {
      darkMode: true as boolean,
    }
  ),
  actions: {
    setDarkMode(val : boolean ){
      this.darkMode = val
      vuetify.theme.global.name.value = val ? 'dark' : 'light'
    },
    loadDarkMode(){
      vuetify.theme.global.name.value = this.darkMode ? 'dark' : 'light'
    },
  },
  getters:{
    getDarkMode: (state) => {
      return state.darkMode
    }
  },
  persist: true
})
