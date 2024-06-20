<script setup lang="ts">
import type {PropType} from "vue";
import type {IRole} from "@drax/identity-front";

const props = defineProps({
  role:{
    type: Object as PropType<IRole>,
    required: true,
  }
})
</script>

<template>
  <v-sheet border class="position-relative d-flex justify-center align-center" height="150">
    <v-sheet class="position-absolute bg-surface-light w-100 top-0" height="65"></v-sheet>
    <v-sheet class="text-center">
      <h6 class="text-h6">{{ role.name }}</h6>
    </v-sheet>
  </v-sheet>

  <v-divider></v-divider>
  <v-sheet class="d-flex justify-center align-center" height="50">
    <v-sheet class="text-center">
    </v-sheet>
  </v-sheet>
</template>

<style scoped>

</style>
