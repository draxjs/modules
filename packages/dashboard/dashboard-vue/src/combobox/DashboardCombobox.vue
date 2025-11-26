<script setup lang="ts">
import {ref, onMounted} from "vue"
import {DashboardProvider} from "@drax/dashboard-front";
import type {IDashboard} from "@drax/dashboard-share";

const valueModel = defineModel<IDashboard | undefined>({default: null})

const loading = ref(false)
const items = ref<IDashboard[]>([])

const fetchDashboards = async () => {
  try {
    loading.value = true
    items.value = await DashboardProvider.instance.find({})
  } catch (error) {
    console.error('Error fetching dashboards:', error)
  }finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDashboards()
})
</script>

<template>
  <v-select
      :loading="loading"
      label="Dashboard"
      v-model="valueModel"
      :items="items"
      item-text="title"
      item-value="_id"
      return-object
  ></v-select>
</template>

<style scoped>

</style>
