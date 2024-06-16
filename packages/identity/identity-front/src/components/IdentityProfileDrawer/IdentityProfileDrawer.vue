<script setup lang="ts">
import {useAuthStore} from "../../stores/auth/AuthStore.js";
import {defineModel, ref} from "vue";
import IdentityProfileAvatar from "../IdentityProfileAvatar/IdentityProfileAvatar.vue";
import IdentityProfileView from "../IdentityProfileView/IdentityProfileView.vue";

const authStore = useAuthStore()

const valueModel = defineModel()

const profile = ref(false)

function gotoLogin(){

}

</script>

<template>


  <v-navigation-drawer
      v-model="valueModel"
      location="right"
  >

    <template v-if="authStore.me">
      <identity-profile-view></identity-profile-view>
      <v-divider></v-divider>

      <v-list>
        <v-list-item
            @click="profile = !profile"
            prepend-icon="mdi-account-cog"
            title="Profile"
        >
        </v-list-item>
        <v-list-item
            @click="authStore.clearAuth"
            prepend-icon="mdi-logout"
            title="Logout"
        >
        </v-list-item>
      </v-list>
    </template>

    <template v-else>
      <v-list>
        <v-list-item
            href="/user/login"
            prepend-icon="mdi-login"
            title="Login"
        >
        </v-list-item>
      </v-list>
    </template>

    <v-dialog v-model="profile" class="h-50">
      <v-card class="h-50">
        <v-card-title>PROFILE</v-card-title>
        <v-card-text>
          <identity-profile-view></identity-profile-view>
        </v-card-text>
      </v-card>
    </v-dialog>

  </v-navigation-drawer>

</template>

<style scoped>

</style>
