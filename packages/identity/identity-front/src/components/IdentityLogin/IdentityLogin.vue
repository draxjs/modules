<script setup lang="ts">
import { VCard, VCardText, VCardTitle, VCardActions } from 'vuetify/components/VCard'
import { VBtn } from 'vuetify/components/VBtn'

defineProps<{
  msg: string
}>()
</script>

<template>

  <v-card variant="tonal">
    <v-card-title><h1>IDENTITY LOGIN</h1></v-card-title>
    <v-card-text>INCA DRAX</v-card-text>
    <v-card-text>{{ msg }}</v-card-text>
    <v-card-actions>
      <v-btn>BUTTON</v-btn>
    </v-card-actions>
  </v-card>
</template>

<style scoped lang="sass">

</style>
