<script setup lang="ts">

defineProps({
  title: {
    type: String,
    required: true
  },
  to: {
    type: Object,
    required: false
  },
  subtitle: {
    type: String,
    required: false
  },
  icon: {
    type: String,
    required: false
  }

})

</script>

<template>
  <v-card :to="to">
    <v-card-title class="primary--text">{{title}}</v-card-title>
    <v-card-subtitle>{{subtitle}}</v-card-subtitle>
    <v-card-text class="text-center">
      <v-icon class="primary--text" size="100">{{icon}}</v-icon>
    </v-card-text>
  </v-card>
</template>



<style scoped>

</style>
