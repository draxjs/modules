<script setup lang="ts">

import CountryCombobox from "@/modules/people/comboboxes/CountryCombobox.vue";

const country = ref()

</script>

<template>
<div>
  <h1>Lab Page</h1>
  <country-combobox v-model="country" add-on-the-fly></country-combobox>
  <p>Country {{country}}</p>
</div>
</template>

<style scoped>

</style>
