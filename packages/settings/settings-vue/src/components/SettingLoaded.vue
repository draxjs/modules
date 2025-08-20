<script setup lang="ts">
import {useSetting} from "../composables/UseSetting";
import {useI18n} from "vue-i18n";

const {settings} = useSetting()
const {t, te} = useI18n()

</script>

<template>
  <v-card variant="outlined" class="ma-2">
    <v-card-title class="text-h4">Settings</v-card-title>
    <v-divider></v-divider>
    <v-card-text>
      <h5 class="text-h5">Public (No requiere auth)</h5>
      <v-chip v-for="(v,k) in settings.filter(s => s.public && !s.permission)" :key="k" class="mt-4" color="blue">
        <b>{{ v.label }}</b>:{{ v.value }}
      </v-chip>
    </v-card-text>
    <v-divider></v-divider>
    <v-card-text>
      <h5 class="text-h5">Private (Requiere auth)</h5>
      <v-chip v-for="(v,k) in settings.filter(s => !s.public && !s.permission)" :key="k" class="mt-4" color="orange">
        <b>{{ v.label }}</b>:{{ v.value }}
      </v-chip>
    </v-card-text>
    <v-divider></v-divider>
    <v-card-text>
      <h5 class="text-h5">Permission (Requiere Permiso Especifico)</h5>
      <v-chip v-for="(v,k) in settings.filter(s => s.permission)" :key="k" class="mt-4" color="purple">
        <b>{{ v.label }}</b>({{v.permission}}):{{ v.value }}
      </v-chip>
    </v-card-text>
  </v-card>
</template>

<style scoped>

</style>
