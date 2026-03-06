<script setup lang="ts">
import DashboardCrud from '../../cruds/DashboardCrud'
import {Crud} from "@drax/crud-vue";
import type {IDashboard} from "@drax/dashboard-share";

</script>

<template>
  <crud :entity="DashboardCrud.instance">
    <template v-slot:item.actions="{ item }">
      <v-btn class="mx-1" variant="text" color="purple" size="small" icon="mdi-view-dashboard" :href="'/dashboard/view/'+ (item as IDashboard)?.identifier">
      </v-btn>
      <v-btn class="mx-1" variant="text" color="indigo" size="small" icon="mdi-cogs" :href="'/dashboard/config/'+ (item as IDashboard)?.identifier">
      </v-btn>
    </template>
  </crud>
</template>

<style scoped>

</style>
