<script setup lang="ts">
import {useAuthStore} from "../../stores/auth/AuthStore.js";
import {defineModel} from "vue";
import IdentityProfileAvatar from "../IdentityProfileAvatar/IdentityProfileAvatar.vue";

const authStore = useAuthStore()

const valueModel = defineModel()

const profile = ref(false)

</script>

<template>


  <v-navigation-drawer
      v-model="valueModel"
      location="right"
  >

    <template v-if="authStore.getAuthUser">
      <v-sheet class="position-relative d-flex justify-center align-center" height="150">
        <v-sheet class="position-absolute bg-surface-light w-100 top-0" height="65"></v-sheet>
        <v-sheet class="text-center">
          <identity-profile-avatar avatar-size="70"></identity-profile-avatar>
          <h6 class="text-h6">{{ authStore.getAuthUser.username }}</h6>
        </v-sheet>
      </v-sheet>

      <v-divider></v-divider>
      <v-sheet class="d-flex justify-center align-center" height="50">
        <v-sheet class="text-center">
          <h6 class="text-caption">{{ authStore.getAuthUser.email }}</h6>
          <h6 class="text-subtitle-2">role: {{ authStore.getAuthUser.role.name }}</h6>
        </v-sheet>
      </v-sheet>
      <v-divider></v-divider>
    </template>

    <v-list>
      <v-list-item
         @click="profile = !profile"
          prepend-icon="mdi-account-cog"
          title="Profile"
      >
      </v-list-item>
      <v-list-item
          @click="authStore.logout"
          prepend-icon="mdi-logout"
          title="Logout"
      >
      </v-list-item>
    </v-list>

    <v-dialog v-model="profile" class="h-50">
      <v-card class="h-50">
        <v-card-title>PROFILE</v-card-title>
        <v-card-text>
          <v-sheet class="position-relative d-flex justify-center align-center" height="150">
            <v-sheet class="position-absolute bg-surface-light w-100 top-0" height="65"></v-sheet>
            <v-sheet class="text-center">
              <identity-profile-avatar avatar-size="70"></identity-profile-avatar>
              <h6 class="text-h6">{{ authStore.getAuthUser.username }}</h6>
            </v-sheet>
          </v-sheet>

        </v-card-text>
      </v-card>
    </v-dialog>

  </v-navigation-drawer>

</template>

<style scoped>

</style>
