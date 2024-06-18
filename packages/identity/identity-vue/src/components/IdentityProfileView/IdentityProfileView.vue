<script setup lang="ts">
import {useAuthStore} from "../../stores/auth/AuthStore.js";
import IdentityProfileAvatar from "../IdentityProfileAvatar/IdentityProfileAvatar.vue";
const emit = defineEmits(['click'])
const authStore = useAuthStore()
const onClick = () => {
  emit('click')
}
</script>

<template>
  <v-sheet class="position-relative d-flex justify-center align-center" height="150">
    <v-sheet class="position-absolute bg-surface-light w-100 top-0" height="65"></v-sheet>
    <v-sheet class="text-center">
      <identity-profile-avatar :avatar-size="70"></identity-profile-avatar>
      <h6 class="text-h6">{{ authStore.authUser?.username }}</h6>
    </v-sheet>
  </v-sheet>

  <v-divider></v-divider>
  <v-sheet class="d-flex justify-center align-center" height="50">
    <v-sheet class="text-center">
      <h6 class="text-caption">{{ authStore.authUser?.email }}</h6>
      <h6 class="text-subtitle-2">role: {{ authStore.authUser?.role?.name }}</h6>
    </v-sheet>
  </v-sheet>
</template>

<style scoped>

</style>
