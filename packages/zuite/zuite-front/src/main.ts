// Plugins
// @ts-ignore
import { registerPlugins } from '@/plugins'

// Components
import App from './App.vue'

// Composables
import { createApp } from 'vue'

const app = createApp(App)
registerPlugins(app)

//Core Systems Factories
import {authSystemFactory} from "./factories/AuthSystemFactory";
import {userSystemFactory} from "./factories/UserSystemFactory";

app
  .provide('AuthSystem', authSystemFactory('GRAPHQL'))
  .provide('UserSystem', userSystemFactory('GRAPHQL'))
  .mount('#app')
