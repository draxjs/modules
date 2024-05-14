<script setup lang="ts">
import {useAuthStore} from "../../stores/auth/AuthStore.js";
import {defineModel} from "vue";

const authStore = useAuthStore()

const valueModel = defineModel()

</script>

<template>


  <v-navigation-drawer
      v-model="valueModel"
      location="right">
    <div class="h-25 flex-column justify-center">
      <v-avatar>
        <v-icon>mdi-shield-account</v-icon>
      </v-avatar>
    </div>
    <v-divider></v-divider>
    {{ JSON.stringify(authStore.getAuthUser) }}

    <v-list>
      <v-list-item
          @click="authStore.logout"
          prepend-icon="mdi-logout"
          title="Logout"
      >

      </v-list-item>
    </v-list>

  </v-navigation-drawer>

</template>

<style scoped>

</style>
