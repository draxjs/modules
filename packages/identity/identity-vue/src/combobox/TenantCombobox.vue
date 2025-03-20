<script setup lang="ts">

import {ref, onMounted, defineModel} from 'vue'
import type { PropType } from 'vue'
import {useI18n} from "vue-i18n";
const {t,te} = useI18n()
defineProps({
  errorMessages: {type: String as PropType<string | string[] | undefined>,},
  clearable: {type: Boolean, default: false},
  readonly: {type: Boolean, default: false},
  itemTitle: {type: String, default: "name"},
  itemValue: {type: String, default: "_id"},
  rules: {type: Array as PropType<any[]>, default: () => []},
  label: {type: String, default: 'tenant.entity'},
  density: {type: String as PropType<'comfortable' | 'compact' | 'default'>, default: 'default'},
  variant: {type: String as PropType<'underlined' | 'outlined' | 'filled' | 'solo' | 'solo-inverted' | 'solo-filled' | 'plain'>, default: 'filled'},
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
      :label="te(label) ? t(label) : label"
      :items="items"
      :item-title="itemTitle"
      :item-value="itemValue"
      :variant="variant"
      :error-messages="errorMessages"
      :clearable="clearable"
      :rules="rules"
      :readonly="readonly"
  ></v-select>
</template>

<style scoped>

</style>
