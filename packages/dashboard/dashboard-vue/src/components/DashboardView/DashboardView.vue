<script setup lang="ts">
import type {PropType} from "vue";
import type {IDashboard} from "@drax/dashboard-share";
import GroupByCard from "../GroupByCard/GroupByCard.vue";
import PaginateCard from "../PaginateCard/PaginateCard.vue";

const {dashboard} = defineProps({
  dashboard: {type: Object as PropType<IDashboard>, required: true},
})

</script>

<template>
  <v-card v-if="dashboard" class="mt-3" >
    <v-card-title>{{dashboard.title}}</v-card-title>
    <v-card-subtitle>{{dashboard.identifier}}</v-card-subtitle>
    <v-card-text>
      <v-row>
        <v-col v-for="(card,i) in dashboard.cards" :key="i"
               :cols="card?.layout?.cols || 12"
               :sm="card?.layout?.sm || 12"
               :md="card?.layout?.md || 12"
               :lg="card?.layout?.lg || 12"
        >
          <v-card :variant="card?.layout?.cardVariant || 'outlined' " :height="card?.layout?.height || 300" style="overflow-y: auto">
            <v-card-title>{{card?.title}}</v-card-title>
            <v-card-text >
              <paginate-card v-if="card?.type === 'paginate'" :card="card" />
              <group-by-card v-else-if="card?.type === 'groupBy'" :card="card" />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>

  </v-card>
</template>

<style scoped>

</style>
