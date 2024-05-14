<script setup lang="ts">
const emit = defineEmits(['click'])
const onClick = () => {
  emit('click')
}
</script>

<template>
  <v-avatar @click="onClick">
    <v-icon>mdi-shield-account</v-icon>
  </v-avatar>
</template>

<style scoped>

</style>
