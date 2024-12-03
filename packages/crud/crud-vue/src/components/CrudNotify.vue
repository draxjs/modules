<script setup lang="ts">

const valueModel = defineModel({type: Boolean, default: false})

defineProps({
  message: {type: String},
  color: {type: String, default: 'success' },
  timeout: {type: Number, default: 3000},
});
</script>

<template>

  <v-snackbar v-model="valueModel" :timeout="timeout" :color="color" >
    {{message}}

    <template v-slot:actions>
      <v-btn
        icon="mdi-close"
        variant="text"
        @click="valueModel = false"
      >
      </v-btn>
    </template>
  </v-snackbar>

</template>

<style scoped>

</style>
