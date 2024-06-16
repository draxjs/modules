<script setup lang="ts">
import {useAuthStore} from "../../stores/auth/AuthStore.js";

const emit = defineEmits(['click'])

const props = defineProps({
  avatarSize: {
    type: Number,
    default: 54
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
  >
    <v-img v-if="authStore.avatarurl" :src="authStore.avatarurl"/>
    <v-icon v-else size="50">mdi-account-circle</v-icon>
  </v-avatar>
</template>

<style scoped>

</style>
