<script setup lang="ts">
import DashboardCrud from '../../cruds/DashboardCrud'
import {Crud} from "@drax/crud-vue";
import type {IDashboard} from "@drax/dashboard-share";

</script>

<template>
  <crud :entity="DashboardCrud.instance">
    <template v-slot:item.actions="{ item }">
      <v-btn size="small" icon="mdi-view-dashboard" :href="'/dashboard/identifier/'+ (item as IDashboard)?.identifier">
      </v-btn>
    </template>
  </crud>
</template>

<style scoped>

</style>
