<script setup lang="ts">
import type {IDashboard} from "@drax/dashboard-share";
import {onMounted, ref} from "vue";
import DashboardConfig from "../components/DashboardConfig/DashboardConfig.vue";
import {useRoute} from "vue-router";
import {DashboardProvider} from "@drax/dashboard-front";

const route = useRoute()

const identifier = route.params.identifier

const dashboardSelected = ref<IDashboard>()

const loading = ref(false)

const findDashboard = async () => {
  try {
    loading.value = true
    const filters = [{field: 'identifier', operator: 'eq', value: identifier}]
    dashboardSelected.value = await DashboardProvider.instance.findOne({filters})
  } catch (error) {
    console.error('Error fetching dashboards:', error)
  } finally {
    loading.value = false
  }
}

const updateDashboard = async () => {
  try {
    if(dashboardSelected?.value){
      loading.value = true
      dashboardSelected.value = await DashboardProvider.instance.update(dashboardSelected.value._id, dashboardSelected?.value)
      console.log("dashboard updated", dashboardSelected.value)
    }
  } catch (error) {
    console.error('Error fetching dashboards:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  findDashboard()
})
</script>

<template>
  <v-container fluid>
    <v-btn size="small" prepend-icon="mdi-view-dashboard" :href="'/dashboard/view/'+identifier">ver</v-btn>

    <v-skeleton-loader :loading="loading"/>
    <dashboard-config v-if="dashboardSelected"
                      v-model="dashboardSelected"
                      @dashboardUpdated="updateDashboard"
    ></dashboard-config>

  </v-container>

</template>

<style scoped>

</style>
