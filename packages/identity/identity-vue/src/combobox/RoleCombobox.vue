<script setup lang="ts">

import {ref, onMounted, defineModel} from 'vue'
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
  ></v-select>
</template>

<style scoped>

</style>
