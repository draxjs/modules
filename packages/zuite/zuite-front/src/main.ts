// Plugins
// @ts-ignore
import { registerPlugins } from '@/plugins'


import i18n from "@/i18n/I18n";

// Components
import App from './App.vue'

// Composables
import { createApp } from 'vue'
import {setupAuth} from "./setup/SetupAuth";

const app = createApp(App)
registerPlugins(app)

app.use(i18n)

setupAuth()

app

  .mount('#app')
