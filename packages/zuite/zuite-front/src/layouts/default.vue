
<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" temporary>
      <sidebar-menu :menu="menu"></sidebar-menu>

    </v-navigation-drawer>
    <v-app-bar  >
      <v-app-bar-nav-icon v-model="menu" @click="drawer=!drawer"/>
      <slot name="toolbar-left"></slot>
      <v-spacer></v-spacer>
      <slot name="toolbar-right"></slot>
      <dark-mode></dark-mode>

      <identity-profile-avatar @click="toggleProfileDrawer"></identity-profile-avatar>
    </v-app-bar>

    <identity-profile-drawer v-model="profileDrawer" ></identity-profile-drawer>


    <v-main>
      drawer: {{drawer}}
      profileDrawer: {{profileDrawer}}
      <router-view/>
    </v-main>

  </v-app>
</template>

<script lang="ts" setup>
import {ref} from 'vue'
import menu from './menu'
import {IdentityProfileAvatar, IdentityProfileDrawer} from "@drax/identity-front";
let profileDrawer = ref(false)
let drawer = ref(false)

const toggleProfileDrawer= () => {
  console.log("ProfileDrawer",profileDrawer.value,!profileDrawer.value)
  profileDrawer.value = !profileDrawer.value
}
</script>
