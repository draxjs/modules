import App from './App.vue'
import i18n from "@/i18n/I18n";
import vuetify from "@/plugins/vuetify";
import router from "@/router";
import pinia from "@/stores";
import { createApp } from 'vue'
import {setupAuth} from "./setup/SetupAuth";
import setupSetting from "./setup/SetupSetting";
import setupDashboard from "./setup/SetupDashboard";
// import setupCustomIdentity from "@/setup/SetupCustomIdentity";

//Setup App
const app = createApp(App)

//Setup Pinia
app.use(pinia)

//Setup Settings
setupSetting().then(() => {console.log("Setting Setup Done")})

//Setup Dashboard
setupDashboard()

//Setup Custom Identity Cruds
//setupCustomIdentity()

//Setup Router, I18n and Vuetify
app
  .use(vuetify)
  .use(router)
  .use(i18n)

//Setup Auth
setupAuth()

//Mount App
app.mount('#app')
