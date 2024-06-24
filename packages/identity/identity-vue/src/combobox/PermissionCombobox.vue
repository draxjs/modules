<script setup lang="ts">

import {ref, onMounted, defineModel} from 'vue'
import type { PropType } from 'vue'

defineProps({
  errorMessages: {
    type: String as PropType<string | string[] | undefined>,
  }
})

const model = defineModel<any>()
import {useRole} from "../composables/useRole";
const {fetchPermissions} = useRole()
let items = ref([])

onMounted(async () => {
  items.value = await fetchPermissions()
})


</script>

<template>
  <v-select
      v-model="model"
      label="Permissions"
      :items="items"
      variant="outlined"
      :error-messages="errorMessages"
      multiple
  >
  </v-select>
</template>

<style scoped>

</style>
