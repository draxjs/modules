import { useVuetifyStore } from '../stores/vuetify/VuetifyStore.js'
import {computed} from "vue";

export function useDarkMode() {

  const vuetifyStore = useVuetifyStore()

  const darkMode = computed({
    get () {
      return vuetifyStore.getDarkMode
    },
    set (val) {
      vuetifyStore.setDarkMode(val)
    }
  })

  function loadDarkMode() {
    vuetifyStore.loadDarkMode()
  }


  return {darkMode, loadDarkMode}

}
