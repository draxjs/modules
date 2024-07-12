<script lang="ts" setup>
import {ref} from 'vue'
import menu from '../menu'
import {IdentityProfileAvatar, IdentityProfileDrawer, useAuth} from "@drax/identity-vue";
import DarkMode from "../components/DarkMode/index.vue";
import SidebarMenu from "../components/SidebarMenu/SidebarMenu.vue";
import AnimatedBackground from "../components/AnimatedBackground/AnimatedBackground.vue";
import {useRouter} from "vue-router";
import { useDarkMode } from '../composables/useDarkMode.js'

const {loadDarkMode} = useDarkMode()

onMounted(() => {
  loadDarkMode()
})

let profileDrawer = ref(false)
let drawer = ref(false)

const {push} = useRouter()

const {isAuthenticated} = useAuth()

</script>

<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" temporary>
      <sidebar-menu :menu="menu"></sidebar-menu>
    </v-navigation-drawer>
    <v-app-bar v-if="isAuthenticated()" >
      <v-app-bar-nav-icon v-model="menu" @click="drawer=!drawer"/>
      <slot name="toolbar-left">
        <v-btn icon @click="push({name:'Root'})">
          <v-icon>mdi-home</v-icon>
        </v-btn>
      </slot>
      <v-spacer></v-spacer>
      <slot name="toolbar-right"></slot>
      <dark-mode></dark-mode>

      <identity-profile-avatar class="cursor-pointer" @click="profileDrawer = !profileDrawer"></identity-profile-avatar>
    </v-app-bar>

    <identity-profile-drawer v-model="profileDrawer" ></identity-profile-drawer>

    <animated-background></animated-background>

    <v-main>
      <router-view/>
    </v-main>

  </v-app>
</template>


