<script setup lang="ts">
import { VCard, VCardText, VCardTitle } from 'vuetify/components/VCard'

defineProps<{
  msg: string
}>()
</script>

<template>

  <v-card text="">
    <v-card-title><h1>IDENTITY LOGIN</h1></v-card-title>
    <v-card-text>INCA DRAX</v-card-text>
    <v-card-text>{{ msg }}</v-card-text>
  </v-card>
</template>

<style scoped lang="sass">

</style>
