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

app
  .use(vuetify)
  .use(router)

// registerPlugins(app)

app.use(i18n)

setupAuth()



app.mount('#app')
