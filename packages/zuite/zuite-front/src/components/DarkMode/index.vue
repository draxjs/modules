<script setup lang="ts">
import { useVuetifyStore } from '../../stores/vuetify/VuetifyStore.js'
import { computed, onMounted } from 'vue'

const vuetifyStore = useVuetifyStore()

const darkMode = computed({
  get () {
    return vuetifyStore.getDarkMode
  },
  set (val) {
    vuetifyStore.setDarkMode(val)
  }
})

onMounted(() => {
  vuetifyStore.loadDarkMode()
})
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
