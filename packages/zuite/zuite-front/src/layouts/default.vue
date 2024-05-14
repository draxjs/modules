
<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" temporary>
      <sidebar-menu :menu="menu"></sidebar-menu>

    </v-navigation-drawer>
    <v-app-bar  >
      <v-app-bar-nav-icon v-model="menu" @click="drawer=!drawer"/>
      <slot name="toolbar-left"></slot>
      <v-spacer></v-spacer>
      <dark-mode></dark-mode>
      <slot name="toolbar-right"></slot>
    </v-app-bar>


    <v-main>
      <router-view/>
    </v-main>

  </v-app>
</template>

<script lang="ts" setup>
import {ref} from 'vue'
import menu from './menu'

let drawer = ref(false)
</script>
