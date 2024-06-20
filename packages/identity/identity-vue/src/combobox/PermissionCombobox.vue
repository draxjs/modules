<script setup lang="ts">

import {ref, onMounted, defineModel} from 'vue'

const props = defineProps({
  errorMessages: {
    type: String as propType<string | string[] | undefined>,
  }
})

const model = defineModel()
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
  ></v-select>
</template>

<style scoped>

</style>
