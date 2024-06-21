<script setup lang="ts">

import {ref, onMounted, defineModel} from 'vue'
import type { PropType } from 'vue'
const props = defineProps({
  errorMessages: {
    type: String as PropType<string | string[] | undefined>,
  }
})

const model = defineModel()
import {useRole} from "../composables/useRole";
const {fetchRole} = useRole()
let items = ref([])

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
      variant="outlined"
      :error-messages="errorMessages"
  ></v-select>
</template>

<style scoped>

</style>
