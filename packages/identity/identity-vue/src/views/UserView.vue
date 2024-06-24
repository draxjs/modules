<script setup lang="ts">
import type {PropType} from "vue";
import type {IUser} from "@drax/identity-front";
import IdentityProfileAvatar from "../components/IdentityProfileAvatar/IdentityProfileAvatar.vue";

defineProps({
  user:{
    type: Object as PropType<IUser>,
    required: true,
  }
})
</script>

<template>
  <v-sheet border class="position-relative d-flex justify-center align-center" height="150">
    <v-sheet class="position-absolute bg-surface-light w-100 top-0" height="65"></v-sheet>
    <v-sheet class="text-center">
      <identity-profile-avatar :avatar-size="70"></identity-profile-avatar>
      <h6 class="text-h6">{{ user.username }}</h6>
    </v-sheet>
  </v-sheet>

  <v-divider></v-divider>
  <v-sheet class="d-flex justify-center align-center" height="50">
    <v-sheet class="text-center">
      <h6 class="text-caption">{{ user.email }}</h6>
      <h6 class="text-subtitle-2">role: {{ user.role?.name }}</h6>
    </v-sheet>
  </v-sheet>
</template>

<style scoped>

</style>
