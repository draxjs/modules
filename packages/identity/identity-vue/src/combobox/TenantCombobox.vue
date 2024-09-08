<script setup lang="ts">

import {ref, onMounted, defineModel} from 'vue'
import type { PropType } from 'vue'
defineProps({
  errorMessages: {
    type: String as PropType<string | string[] | undefined>,
  },
  clearable: {
    type: Boolean,
    default: false,
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
      :label="$t ? $t('tenant.entity') : 'Tenant'"
      :items="items"
      item-title="name"
      item-value="id"
      variant="outlined"
      :error-messages="errorMessages"
      :clearable="clearable"
  ></v-select>
</template>

<style scoped>

</style>
