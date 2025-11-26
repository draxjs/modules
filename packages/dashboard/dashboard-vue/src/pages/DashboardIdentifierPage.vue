<script setup lang="ts">
import type {IDashboard} from "@drax/dashboard-share";
import {onMounted, ref} from "vue";
import DashboardView from "../components/DashboardView/DashboardView.vue";
import {useRoute} from "vue-router";
import {DashboardProvider} from "@drax/dashboard-front";

const route = useRoute()

const identifier = route.params.identifier

const dashboardSelected = ref<IDashboard>()

const loading = ref(false)

const findDashboard = async () => {
  try {
    loading.value = true
    const filters = [{field:'identifier', operator:'eq', value: identifier}]
    dashboardSelected.value = await DashboardProvider.instance.findOne({filters})
  } catch (error) {
    console.error('Error fetching dashboards:', error)
  }finally {
    loading.value = false
  }
}

onMounted(() => {
  findDashboard()
})
</script>

<template>
  <v-container >

    <v-skeleton-loader :loading="loading"  />
   <dashboard-view v-if="dashboardSelected" :dashboard="dashboardSelected"></dashboard-view>

  </v-container>

</template>

<style scoped>

</style>
