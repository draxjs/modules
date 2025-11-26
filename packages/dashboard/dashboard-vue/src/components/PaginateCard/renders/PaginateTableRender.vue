<script setup lang="ts">
import type {PropType} from "vue";
import {useDateFormat} from "@drax/common-vue"
import type {IDraxDateFormatUnit} from "@drax/common-share";
import type {IEntityCrudField} from "@drax/crud-share";
import type {IDraxPaginateResult} from "@drax/crud-share";

const {formatDateByUnit} = useDateFormat()

const {data, headers, fields, dateFormat} = defineProps({
  data: {type: Object as PropType<IDraxPaginateResult<any>>, required: false},
  headers: {type: Array as PropType<any[]>, required: false},
  fields: {type: Array as PropType<IEntityCrudField[]>, required: false},
  dateFormat: {type: String as PropType<IDraxDateFormatUnit>, required: false, default:'day'},
})


</script>

<template>
  <div v-if="data">
    <v-data-table-server
        :headers="headers"
        :items="data?.items"
        density="compact"
        v-model:page="data.page"
        v-model:items-per-page="data.limit"
        :items-length="data.total"
        striped="odd"
        hide-default-footer
    >

      <!-- Slot para personalizar la visualización de cada campo -->
      <template
          v-for="field in fields"
          :key="field.name"
          v-slot:[`item.${field.name}`]="{ value }"
      >
        <template v-if="field.type === 'ref' && field.refDisplay">
          {{value[field.refDisplay]}}
        </template>
        <template v-else-if="field.type === 'date'">
          {{ formatDateByUnit(value, dateFormat) }}
        </template>
        <template v-else>
          {{ value }}
        </template>

      </template>


    </v-data-table-server>


  </div>

</template>

<style scoped>
.percentage-text {
  display: inline-block;
  min-width: 45px;
  text-align: right;
}
</style>
