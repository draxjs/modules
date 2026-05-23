<script setup lang="ts">
import { computed,  type PropType } from 'vue'
import type { IEntityCrud } from '@drax/crud-share'
import { useCrudStore } from '../stores/UseCrudStore'
import { useI18n } from 'vue-i18n'
import { useFilterIcon } from '../composables/UseFilterIcon'
import CrudRefDisplay from "./CrudRefDisplay.vue";
import {formatDate} from "@drax/common-front"
import {isRangeOperator, normalizeDateRangeValue} from "../helpers/CrudRangeFilters";

const { t} = useI18n()

const { filterIcon } = useFilterIcon()

const props = defineProps({
  entity: {
    type: Object as PropType<IEntityCrud>,
    required: true
  }
})

const store = useCrudStore(props.entity?.name)

const activeFilters = computed<any[]>(() => {
  return store.filters
    .map((filter:any, index: any) => {
      const filterDef = props.entity.filters[index]
      if (!filterDef) return null

      // Solo mostrar si tiene valor
      if (filter.value === null || filter.value === undefined || filter.value === '') {
        return null
      }

      // Para arrays vacíos
      if (Array.isArray(filter.value) && filter.value.length === 0) {
        return null
      }

      if (isRangeOperator(filterDef)) {
        const rangeValue = normalizeDateRangeValue(filter.value)
        if (!rangeValue.from && !rangeValue.to) {
          return null
        }
      }

      return {
        ...filterDef,
        value: filter.value,
        index
      }
    })
    .filter((f: any) => f !== null)
})

const getFilterLabel = (filter: any) => {
  const label = t(`${props.entity.name.toLowerCase()}.field.${filter.label}`, filter.label)
  return label
}

const formatRangeDate = (value: string | Date) => {
  return formatDate(value instanceof Date ? value.toISOString() : value)
}



const getFilterValue = (filter: any) => {
  if (isRangeOperator(filter)) {
    const rangeValue = normalizeDateRangeValue(filter.value)
    const from = rangeValue.from ? formatRangeDate(rangeValue.from) : t('crud.from')
    const to = rangeValue.to ? formatRangeDate(rangeValue.to) : t('crud.to')
    return `${from} - ${to}`
  }

  switch (filter.type) {
    case 'date':
      return formatDate(filter.value)

    case 'boolean':
      return filter.value ? t('common.yes') : t('common.no')

    case 'ref':
      return  filter.value

    case 'array.ref':
      if (Array.isArray(filter.value)) {
        return filter.value.map((v: any) => v[filter.refDisplay] || v).join(', ')
      }
      return filter.value

    case 'enum':
      return filter.value

    case 'array.enum':
      if (Array.isArray(filter.value)) {
        return filter.value.join(', ')
      }
      return filter.value

    case 'number':
      return filter.value.toString()

    case 'string':
    default:
      return filter.value
  }
}

const removeFilter = (index: number) => {
  const filter = store.filters[index]
  const filterDef = props.entity.filters[index]

  // Resetear al valor por defecto
  filter.value = filterDef?.default

  // Emitir evento para aplicar filtros
  emit('filterRemoved')
}


const emit = defineEmits(['filterRemoved', 'filtersCleared'])
</script>

<template>
  <v-card v-if="activeFilters.length > 0" id="crud-active-filters" flat class="crud-active-filters mb-2">
    <v-card-text id="crud-active-filters-content" class="crud-active-filters__content py-2">
      <div id="crud-active-filters-list" class="crud-active-filters__list d-flex align-center flex-wrap ga-2">
        <span id="crud-active-filters-label" class="crud-active-filters__label text-caption text-medium-emphasis">
          <v-icon id="crud-active-filters-icon" class="crud-active-filters__icon" size="x-small">mdi-filter</v-icon> {{ t('crud.activeFilters') }}:
        </span>

        <v-chip
          v-for="filter in activeFilters"
          :key="filter.index"
          :id="`crud-active-filter-${filter.index}`"
          class="crud-active-filters__chip"
          closable
          size="small"
          color="primary"
          variant="tonal"
          @click:close="removeFilter(filter.index)"
        >

          <span class="crud-active-filters__chip-label font-weight-medium">{{ getFilterLabel(filter) }}</span>
          <v-icon :icon="filterIcon(filter)" size="x-small" class="crud-active-filters__chip-icon mx-1" />
          <span v-if="['ref','array.ref'].includes(filter.type)" class="crud-active-filters__chip-ref-value">
            <crud-ref-display
                :ref-display="filter.refDisplay"
                :value="filter.value"
                :entity="entity.getRef(filter.ref)" />
          </span>
          <span v-else class="crud-active-filters__chip-value">{{ getFilterValue(filter) }}</span>

          <v-tooltip
            v-if="filter.endOfDay"
            activator="parent"
            location="top"
          >
            {{ t('crud.endOfDayFilter') }}
          </v-tooltip>
        </v-chip>

      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.v-chip {
  max-width: 300px;
}
</style>
