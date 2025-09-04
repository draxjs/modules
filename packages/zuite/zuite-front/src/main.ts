// Plugins
// @ts-ignore
import { registerPlugins } from '@/plugins'


import i18n from "@/i18n/I18n";

// Components
import App from './App.vue'
import vuetify from "@/plugins/vuetify";
import router from "@/router";
import pinia from "@/stores";

// Composables
import { createApp } from 'vue'
import {setupAuth} from "./setup/SetupAuth";

const app = createApp(App)

app.use(pinia)

import { useSetting } from '@drax/settings-vue'
const {fetchSettings, suscribeAuth} = useSetting()
await fetchSettings()
await suscribeAuth()

import { useIdentityCrudStore } from '@drax/identity-vue'
import CustomUserCrud from './modules/base/cruds/CustomUserCrud'
import CustomRoleCrud from "./modules/base/cruds/CustomRoleCrud";
const identityCrudStore = useIdentityCrudStore()
identityCrudStore.setUserCrud(new CustomUserCrud())
identityCrudStore.setRoleCrud(new CustomRoleCrud())

app
  .use(vuetify)
  .use(router)
  .use(i18n)




setupAuth()



app.mount('#app')
