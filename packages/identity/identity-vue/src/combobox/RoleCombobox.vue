<script setup lang="ts">
import {ref, onMounted, defineModel} from 'vue'
import type {PropType} from 'vue'
import type {IRole} from "@drax/identity-share";
import {useRole} from "../composables/useRole";

defineProps({
  errorMessages: {type: String as PropType<string | string[] | undefined>},
  multiple: {type: Boolean, default: false},
  clearable: {type: Boolean, default: false},
  readonly: {type: Boolean, default: false},
  density: {type: String as PropType<'comfortable' | 'compact' | 'default'>, default: 'default'},
  variant: {type: String as PropType<'underlined' | 'outlined' | 'filled' | 'solo' | 'solo-inverted' | 'solo-filled' | 'plain'>, default: 'filled'},
})

const model = defineModel<any>()

const {fetchRole} = useRole()
let items = ref<IRole[]>([])

onMounted(async () => {
  items.value = await fetchRole()
})
</script>

<template>
  <v-select
      v-model="model"
      label="Rol"
      :items="items"
      item-title="name"
      item-value="id"
      :variant="variant"
      :error-messages="errorMessages"
      :multiple="multiple"
      :clearable="clearable"
      :readonly="readonly"
      :density="density"
  ></v-select>
</template>

<style scoped>

</style>
