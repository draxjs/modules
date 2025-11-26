<script setup lang="ts">

import DashboardCombobox from "../combobox/DashboardCombobox.vue";
import type {IDashboard} from "@drax/dashboard-share";
import {ref} from "vue";
import DashboardView from "../components/DashboardView/DashboardView.vue";

const dashboardSelected = ref<IDashboard>()
</script>

<template>
  <v-container >
    <v-toolbar>
      <dashboard-combobox v-model="dashboardSelected"></dashboard-combobox>
    </v-toolbar>

   <dashboard-view v-if="dashboardSelected" :dashboard="dashboardSelected"></dashboard-view>

  </v-container>

</template>

<style scoped>

</style>
