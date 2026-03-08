<script setup lang="ts">
import DashboardCrud from '../../cruds/DashboardCrud'
import {Crud} from "@drax/crud-vue";
import type {IDashboard} from "@drax/dashboard-share";

</script>

<template>
  <crud :entity="DashboardCrud.instance">

    <template v-slot:item="{item}">
      <v-card class="h-100 pa-2">
        <v-card-title>{{item.title}}</v-card-title>
        <v-card-subtitle>{{item.identifier}}</v-card-subtitle>
      </v-card>
    </template>

    <template v-slot:item.actions="{ item }">
      <v-btn class="mx-1" variant="text" color="purple"  icon="mdi-view-dashboard" :href="'/dashboard/view/'+ (item as IDashboard)?.identifier">
      </v-btn>
      <v-btn class="mx-1" variant="text" color="indigo"  icon="mdi-table-edit" :href="'/dashboard/config/'+ (item as IDashboard)?.identifier">
      </v-btn>
    </template>
  </crud>
</template>

<style scoped>

</style>
