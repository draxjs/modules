<script setup lang="ts">
import {defineEmits} from 'vue'
import {useAuthStore} from "../../stores/auth/AuthStore.js";



defineProps({
  avatarSize: {
    type: Number,
    default: 54
  },
  customClass:{
    type: String,
    default: ''
  }
})

const authStore = useAuthStore()

const emits = defineEmits(['click'])

</script>

<template>
  <v-avatar
      :size="avatarSize"
      @click="emits('click')"
      color="surface"
      class="border-md border-opacity-100 border-surface-light"
      :class="customClass"
  >
    <v-img v-if="authStore.authUser && authStore.authUser.avatar" :src="authStore.authUser.avatar" class="d-flex justify-center align-center">
      <slot />
    </v-img>
    <v-icon v-else size="50">mdi-account-circle</v-icon>

  </v-avatar>
</template>

<style scoped>


</style>
