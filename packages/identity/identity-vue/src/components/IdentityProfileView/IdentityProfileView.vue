<script setup lang="ts">
import {useAuthStore} from "../../stores/auth/AuthStore.js";
import IdentityProfileAvatarEdit from "../IdentityProfileAvatarEdit/IdentityProfileAvatarEdit.vue";
import {useI18n} from "vue-i18n";
defineEmits(['click'])
const authStore = useAuthStore()
const {t} = useI18n()
</script>

<template>
  <v-sheet class="position-relative d-flex justify-center align-center" height="150">
    <v-sheet class="position-absolute bg-surface-light w-100 top-0" height="65"></v-sheet>
    <v-sheet class="text-center">
      <identity-profile-avatar-edit :avatar-size="90"></identity-profile-avatar-edit>
      <h6 class="text-h6">{{ authStore.authUser?.username }}</h6>
    </v-sheet>
  </v-sheet>

  <v-divider></v-divider>
  <v-sheet class="d-flex justify-center align-center" height="70">
    <v-sheet class="text-center">
      <h6 class="text-caption">{{ authStore.authUser?.email }}</h6>
      <h6 class="text-caption">{{ authStore.authUser?.tenant?.name }}</h6>
      <h6 class="text-subtitle-2">{{t('user.field.role')}}: {{ authStore.authUser?.role?.name }}</h6>
    </v-sheet>
  </v-sheet>
</template>

<style scoped>

</style>
