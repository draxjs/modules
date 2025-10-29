import App from './App.vue'
import i18n from "@/i18n/I18n";
import vuetify from "@/plugins/vuetify";
import router from "@/router";
import pinia from "@/stores";
import { createApp } from 'vue'
import {setupAuth} from "./setup/SetupAuth";

//Setup App
const app = createApp(App)

//Setup Pinia
app.use(pinia)

//Setup Settings
import { useSetting } from '@drax/settings-vue'
const {fetchSettings, suscribeAuth} = useSetting()
await fetchSettings()
await suscribeAuth()

//Setup Custom Identity Cruds
import { useIdentityCrudStore } from '@drax/identity-vue'
import CustomUserCrud from './modules/base/cruds/CustomUserCrud'
import CustomRoleCrud from "./modules/base/cruds/CustomRoleCrud";
const identityCrudStore = useIdentityCrudStore()
identityCrudStore.setUserCrud(new CustomUserCrud())
identityCrudStore.setRoleCrud(new CustomRoleCrud())

//Setup Router, I18n and Vuetify
app
  .use(vuetify)
  .use(router)
  .use(i18n)

//Setup Auth
setupAuth()

//Mount App
app.mount('#app')
