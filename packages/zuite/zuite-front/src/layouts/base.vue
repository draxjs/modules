<script lang="ts" setup>
import { useAuth} from "@drax/identity-vue";
import { useSettingStore} from "@drax/settings-vue";
import DarkMode from "../components/DarkMode/index.vue";
import {useRouter} from "vue-router";
import { useDarkMode } from '../composables/useDarkMode.js'

const {loadDarkMode} = useDarkMode()

onMounted(() => {
  loadDarkMode()
})


const {push} = useRouter()

const {isAuthenticated} = useAuth()


const appName = computed(() => {
  const settingStore = useSettingStore()
  return settingStore.getSettingValueByKey('STRING')
})

</script>

<template>
  <v-app>

    <v-app-bar density="compact" v-if="isAuthenticated()" >
      <slot name="toolbar-left">
        <v-btn icon @click="push({name:'Root'})">
          <v-icon>mdi-home</v-icon>
        </v-btn>
        {{appName}}
      </slot>
      <v-spacer></v-spacer>
      <slot name="toolbar-right"></slot>
      <dark-mode></dark-mode>
    </v-app-bar>

    <v-main>
      <router-view/>
    </v-main>

  </v-app>
</template>


