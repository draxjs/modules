<script setup lang="ts">

import {ref, onMounted, defineModel} from 'vue'
import type { PropType } from 'vue'
defineProps({
  errorMessages: {
    type: String as PropType<string | string[] | undefined>,
  }
})

const model = defineModel<any>()
import {useTenant} from "../composables/useTenant";
const {fetchTenant} = useTenant()
let items = ref([])

onMounted(async () => {
  items.value = await fetchTenant()
})


</script>

<template>
  <v-select
      v-model="model"
      label="Tenant"
      :items="items"
      item-title="name"
      item-value="id"
      variant="outlined"
      :error-messages="errorMessages"
  ></v-select>
</template>

<style scoped>

</style>
