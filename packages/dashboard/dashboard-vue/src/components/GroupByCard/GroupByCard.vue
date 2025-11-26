<script setup lang="ts">
import type {PropType} from "vue";
import type {IDashboardCard} from "@drax/dashboard-share";
import {useDashboardCard} from "../../composables/UseDashboardCard";
import GroupByTableRender from "./renders/GroupByTableRender.vue";
import GroupByPieRender from "./renders/GroupByPieRender.vue";
import GroupByBarsRender from "./renders/GroupByBarsRender.vue";
import GroupByGalleryRender from "./renders/GroupByGalleryRender.vue";
import {ref, onMounted, defineProps } from "vue";


const {card} = defineProps({
  card: {type: Object as PropType<IDashboardCard>, required: true},
})

const {fetchGroupByData, groupByHeaders, cardEntityFields} = useDashboardCard(card)

const data = ref<any[]>()

onMounted(async ()=> {
  data.value = await fetchGroupByData()
})

</script>

<template>
  <group-by-table-render  v-if="card?.groupBy?.render === 'table'"
                          :data="data"
                          :headers="groupByHeaders"
                          :fields="cardEntityFields"
  />

  <group-by-pie-render  v-else-if="card?.groupBy?.render === 'pie'"
                        :data="data"
                        :headers="groupByHeaders"
                        :fields="cardEntityFields"
  />

  <group-by-bars-render  v-else-if="card?.groupBy?.render === 'bars'"
                        :data="data"
                        :headers="groupByHeaders"
                        :fields="cardEntityFields"
                         :show-legend="false"
  />

  <group-by-gallery-render  v-else-if="card?.groupBy?.render === 'gallery'"
                         :data="data"
                         :headers="groupByHeaders"
                         :fields="cardEntityFields"
                         :show-legend="false"
  />

</template>

<style scoped>

</style>
