<script setup lang="ts">
import {DashboardView} from "@drax/dashboard-vue"
import {auditDashboard} from "../dashboards/AuditDashboard"
import {ref} from "vue"
import { VDateInput } from 'vuetify/labs/VDateInput'
import type {IDashboardBase, IDashboardCard} from "@drax/dashboard-share";

const today = new Date()
today.setHours(23, 59, 59, 999)
const firstDayOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1)
const filters = ref([
  {field: "createdAt", operator:"gte", value: firstDayOfCurrentMonth},
  {field: "createdAt", operator:"lte", value: today},
    ]
)

const ad = ref<IDashboardBase>(auditDashboard)

ad.value.cards?.forEach((card:IDashboardCard) => {
  card.filters = filters.value
})

</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="6">
        <v-date-input v-model="filters[0].value" label="From"></v-date-input>
      </v-col>
      <v-col cols="6">
        <v-date-input v-model="filters[1].value" label="To"></v-date-input>
      </v-col>


    </v-row>
    <dashboard-view :dashboard="ad"></dashboard-view>
  </v-container>
</template>

<style scoped>

</style>
