<script setup lang="ts">
import {DashboardView} from "@drax/dashboard-vue"
import type {IDashboardBase} from "@drax/dashboard-share";
import {ref} from "vue";
import {createPersonDashboard} from "../dashboards/PersonDashboard";

const dashboard = ref<IDashboardBase>(createPersonDashboard())
</script>

<template>
  <v-container fluid>
    <dashboard-view :dashboard="dashboard" />
  </v-container>
</template>

<style scoped>

</style>
