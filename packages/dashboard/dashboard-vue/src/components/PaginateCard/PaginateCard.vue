<script setup lang="ts">
import type {PropType} from "vue";
import type {IDashboardCard} from "@drax/dashboard-share";
import {useDashboardCard} from "../../composables/UseDashboardCard";
import PaginateTableRender from "./renders/PaginateTableRender.vue";
import {ref, onMounted, defineProps } from "vue";
import type {IDraxPaginateResult} from "@drax/crud-share";


const {card} = defineProps({
  card: {type: Object as PropType<IDashboardCard>, required: true},
})

const {fetchPaginateData, cardEntityFields, paginateHeaders} = useDashboardCard(card)

const data = ref<IDraxPaginateResult<any>>()

onMounted(async ()=> {
  data.value = await fetchPaginateData()
})

</script>

<template>
  <paginate-table-render  v-if="card?.groupBy?.render === 'table'"
                          :data="data"
                          :fields="cardEntityFields"
                          :headers="paginateHeaders"
  />

</template>

<style scoped>

</style>
