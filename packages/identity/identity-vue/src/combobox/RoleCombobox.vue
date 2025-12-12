<script setup lang="ts">
import {ref, onMounted, defineModel} from 'vue'
import type {PropType} from 'vue'
import type {IRole} from "@drax/identity-share";
import {useRole} from "../composables/useRole";
import {useI18n} from "vue-i18n";


const {t,te} = useI18n()


defineProps({
  errorMessages: {type: String as PropType<string | string[] | undefined>},
  rules: {type: Array as PropType<any[]>, default: () => []},
  multiple: {type: Boolean, default: false},
  clearable: {type: Boolean, default: false},
  itemTitle: {type: String, default: "name"},
  itemValue: {type: String, default: "_id"},
  readonly: {type: Boolean, default: false},
  label: {type: String, default: 'role.entity'},
  density: {type: String as PropType<'comfortable' | 'compact' | 'default'>, default: 'default'},
  variant: {type: String as PropType<'underlined' | 'outlined' | 'filled' | 'solo' | 'solo-inverted' | 'solo-filled' | 'plain'>, default: 'filled'},
})

const model = defineModel<any>()

const {fetchRole} = useRole()
let items = ref<IRole[]|undefined>([])

onMounted(async () => {
  items.value = await fetchRole()
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
      :multiple="multiple"
      :clearable="clearable"
      :readonly="readonly"
      :density="density"
      :rules="rules"
  ></v-select>
</template>

<style scoped>

</style>
