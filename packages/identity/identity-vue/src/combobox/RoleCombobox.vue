<script setup lang="ts">

import {ref, onMounted, defineProps} from 'vue'
const props = defineProps({
  modelValue: {
    type: String,
  },
})

import {useRole} from "../composables/useRole";

const {fetchRole} = useRole()

let items = ref([])

onMounted(async () => {
  items.value = await fetchRole()
})


</script>

<template>
  <v-select
      v-model="props.modelValue"
      label="Rol"
      :items="items"
      item-title="name"
      item-value="id"
  ></v-select>
</template>

<style scoped>

</style>
