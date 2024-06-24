<script setup lang="ts">
import {useAuthStore} from "../../stores/auth/AuthStore.js";

const emit = defineEmits(['click'])

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
const onClick = () => {
  emit('click')
}
</script>

<template>
  <v-avatar
      :size="avatarSize"
      @click="onClick"
      color="surface"
      class="border-md border-opacity-100 border-surface-light"
      :class="customClass"
  >
    <v-img v-if="authStore.authUser && authStore.authUser.avatar" :src="authStore.authUser.avatar"/>
    <v-icon v-else size="50">mdi-account-circle</v-icon>
  </v-avatar>
</template>

<style scoped>

</style>
