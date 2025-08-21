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

// Fetch settings to initialize settings store state
import { useSetting } from '@drax/settings-vue'
const {fetchSettings, suscribeAuth} = useSetting()
await fetchSettings()
await suscribeAuth() //Refresh settings on auth state change

app.mount('#app')
