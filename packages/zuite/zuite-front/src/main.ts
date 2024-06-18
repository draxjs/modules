// Plugins
// @ts-ignore
import { registerPlugins } from '@/plugins'
//Core Systems Factories
import {SystemFactory} from "./factories/SystemFactory";

import i18n from "@/i18n/I18n";

// Components
import App from './App.vue'

// Composables
import { createApp } from 'vue'

const app = createApp(App)
registerPlugins(app)

app.use(i18n)

const {authSystem: AuthSystem, userSystem: UserSystem, roleSystem: RoleSystem} = SystemFactory()

app
  .provide('AuthSystem', AuthSystem)
  .provide('UserSystem', UserSystem)
  .provide('RoleSystem', RoleSystem)
  .mount('#app')
