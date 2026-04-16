<script setup lang="ts">
import type {PropType} from "vue";
import {computed} from "vue";
import {useDateFormat} from "@drax/common-vue"
import type {IDraxDateFormatUnit} from "@drax/common-share";
import type {IEntityCrudField} from "@drax/crud-share";

const {formatDateByUnit} = useDateFormat()

const {data, headers, fields, dateFormat} = defineProps({
  data: {type: Array as PropType<any[]>, required: false},
  headers: {type: Array as PropType<any[]>, required: false},
  fields: {type: Array as PropType<IEntityCrudField[]>, required: false},
  dateFormat: {type: String as PropType<IDraxDateFormatUnit>, required: false, default:'day'},
})

// Calcular el total de todos los counts
const totalCount = computed(() => {
  if (!data || data.length === 0) return 0
  return data.reduce((sum, item) => sum + (item.count || 0), 0)
})

// Calcular el porcentaje para cada item
const getPercentage = (count: number) => {
  if (totalCount.value === 0) return 0
  return ((count / totalCount.value) * 100).toFixed(1)
}

</script>

<template>
  <div class="table-render">
    <div class="table-render__scroll">
      <v-data-table
          :headers="headers"
          :items="data"
          density="compact"
          :items-per-page="-1"
          hide-default-footer
          height="100%"
          :fixed-header="true"
          class="table-render__table"
      >
        <template v-slot:bottom></template>

        <!-- Slot para personalizar la visualización de cada campo -->
        <template
            v-for="field in fields"
            :key="field.name"
            v-slot:[`item.${field.name}`]="{ value }"
        >
          <template v-if="['ref','object'].includes(field.type) && field.refDisplay">
            {{value ? value[field.refDisplay] : '-' }}
          </template>

          <template v-else-if="field.type === 'date'">
            {{ formatDateByUnit(value, dateFormat) }}
          </template>

          <template v-else-if="field.type === 'number'">
            {{ value.toLocaleString('es-ar') }}
          </template>

          <template v-else>
            {{ value }}
          </template>

        </template>

        <!-- Formato especial para el count con porcentaje -->
        <template v-slot:item.count="{ item }">
          <div class="d-flex align-center justify-end ga-2">
            <v-chip color="primary" size="small" variant="flat">
              {{ item.count }}
            </v-chip>
            <span class="text-caption text-grey text-left percentage-text">
              ({{ getPercentage(item.count) }}%)
            </span>
          </div>
        </template>
      </v-data-table>
    </div>

    <!-- Fila de totales -->
    <v-divider class="my-2"></v-divider>
    <div class="d-flex align-center justify-space-between px-4 py-2">
      <span class="text-subtitle-1 font-weight-medium">Total</span>
      <v-chip color="primary" variant="flat">
        {{ totalCount }}
      </v-chip>
    </div>
  </div>

</template>

<style scoped>
.table-render {
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.table-render__scroll {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.table-render__table {
  height: 100%;
}

.percentage-text {
  display: inline-block;
  min-width: 45px;
  text-align: right;
}
</style>
