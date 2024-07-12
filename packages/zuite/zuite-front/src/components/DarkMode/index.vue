<script setup lang="ts">
import { useDarkMode } from '../../composables/useDarkMode.js'

const { darkMode } = useDarkMode()

</script>

<template>
  <div class="px-3">
    <v-switch
      :ripple="false"
      v-model="darkMode"
      true-icon="mdi-weather-night"
      false-icon="mdi-weather-sunny"
      inset
      hide-details
    ></v-switch>
  </div>
</template>

<style>
.v-switch .v-icon {
  font-size: 18px;
}
</style>
