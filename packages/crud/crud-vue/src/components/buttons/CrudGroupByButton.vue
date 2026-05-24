<script setup lang="ts">
import type { PropType } from 'vue'
import { computed } from 'vue'
import type { IEntityCrud } from "@drax/crud-share"
import { useDateFormat } from "@drax/common-vue"
import { useI18n } from "vue-i18n"
import { useCrudGroupBy } from '../../composables/UseCrudGroupBy'
import CrudActiveFilters from "../CrudActiveFilters.vue";
import { useCrudButtonConfig } from "../../config/CrudButtonConfig";

const { t, te } = useI18n()
const buttonConfig = useCrudButtonConfig("groupBy")

const {formatDateByUnit} = useDateFormat()

const props = defineProps({
  entity: { type: Object as PropType<IEntityCrud>, required: true }
})

const emit = defineEmits(['groupBy'])

const {
  dialog,
  selectedFields,
  loading,
  groupByData,
  availableFields,
  dateFormat,
  hasDateFields,
  dateFormatOptions,
  openDialog,
  resetAndClose,
  handleGroupBy
} = useCrudGroupBy(props.entity)



// Generar headers dinámicamente basados en los campos seleccionados
const headers = computed(() => {
  if (!groupByData.value.length || !selectedFields.value.length) return []

  const fieldHeaders = selectedFields.value.map(field => {
    const label = field.name

    return {
      title: te(`${props.entity.name.toLowerCase()}.field.${label}`)
        ? t(`${props.entity.name.toLowerCase()}.field.${label}`)
        : label,
      key: field.name,
      align: 'start' as const
    }
  })

  return [
    ...fieldHeaders,
    {
      title: t('crud.groupBy.count'),
      key: 'count',
      align: 'end' as const
    }
  ]
})

// Calcular total de registros
const totalCount = computed(() => {
  return groupByData.value.reduce((sum: Number, item: any) => sum + (item.count || 0), 0)
})
</script>

<template>
  <div id="crud-group-by-wrapper" class="crud-group-by-wrapper">
    <v-btn
      id="crud-group-by-button"
      class="crud-group-by-button mr-1"
      icon
      :variant="buttonConfig.variant"
      :rounded="buttonConfig.rounded"
      :color="buttonConfig.color"
      @click="openDialog"
    >
      <v-icon id="crud-group-by-button-icon" class="crud-group-by-button__icon">{{ buttonConfig.icon }}</v-icon>
      <v-tooltip activator="parent" location="bottom">
        {{ t('crud.groupBy.button') }}
      </v-tooltip>
    </v-btn>

    <v-dialog id="crud-group-by-dialog" class="crud-group-by-dialog" v-model="dialog" max-width="800" >
      <v-card id="crud-group-by-card" class="crud-group-by-dialog__card">
        <v-card-title id="crud-group-by-title" class="crud-group-by-dialog__title d-flex align-center">
          <v-icon id="crud-group-by-title-icon" class="crud-group-by-dialog__title-icon mr-2">mdi-chart-bar</v-icon>
          {{ t('crud.groupBy.title') }}
          <v-spacer></v-spacer>
          <v-btn
            id="crud-group-by-close-button"
            class="crud-group-by-dialog__close-button"
            icon
            variant="text"
            @click="resetAndClose"
            :disabled="loading"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text id="crud-group-by-config" class="crud-group-by-dialog__config">
          <crud-active-filters id="crud-group-by-active-filters" class="crud-group-by-dialog__active-filters" :entity="entity"></crud-active-filters>
          <v-divider></v-divider>

          <v-select
            id="crud-group-by-fields-select"
            class="crud-group-by-dialog__fields-select"
            v-model="selectedFields"
            :items="availableFields"
            item-title="label"
            :label="t('crud.groupBy.selectFields')"
            multiple
            chips
            closable-chips
            return-object
            :menu-props="{ zIndex: 3000 }"
          >
          </v-select>

          <!-- Selector de formato de fecha -->
          <v-select
            v-if="hasDateFields"
            id="crud-group-by-date-format-select"
            v-model="dateFormat"
            :items="dateFormatOptions"
            :label="t('crud.groupBy.dateFormatLabel')"
            density="compact"
            variant="outlined"
            class="crud-group-by-dialog__date-format-select mt-4"
            :menu-props="{ zIndex: 3000 }"
          >
            <template v-slot:prepend-inner>
              <v-icon>mdi-calendar-clock</v-icon>
            </template>
          </v-select>


        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions id="crud-group-by-actions" class="crud-group-by-dialog__actions">
          <v-spacer></v-spacer>
          <v-btn
            id="crud-group-by-apply-button"
            class="crud-group-by-dialog__apply-button"
            color="primary"
            variant="flat"
            @click="handleGroupBy"
            :disabled="selectedFields.length === 0"
            :loading="loading"
          >
            {{ t('action.apply') }}
          </v-btn>
        </v-card-actions>
        <v-divider class="mb-4"></v-divider>
        <!-- Tabla de resultados -->
        <v-card-text v-if="groupByData.length > 0" id="crud-group-by-results" class="crud-group-by-dialog__results">


          <div id="crud-group-by-results-header" class="crud-group-by-dialog__results-header d-flex align-center mb-3">
            <v-icon id="crud-group-by-results-icon" class="crud-group-by-dialog__results-icon mr-2">mdi-table</v-icon>
            <span id="crud-group-by-results-title" class="crud-group-by-dialog__results-title text-h6">{{ t('crud.groupBy.results') }}</span>
            <v-spacer></v-spacer>
            <v-chip id="crud-group-by-total-chip" class="crud-group-by-dialog__total-chip" color="primary" variant="flat" size="small">
              {{ t('crud.groupBy.total') }}: {{ totalCount }}
            </v-chip>
          </div>


          <v-data-table
            id="crud-group-by-results-table"
            class="crud-group-by-dialog__results-table"
            :headers="headers"
            :items="groupByData"
            density="compact"
            :items-per-page="-1"
            hide-default-footer
          >
            <template v-slot:bottom></template>

            <!-- Slot para personalizar la visualización de cada campo -->
            <template
              v-for="field in selectedFields"
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

            <!-- Formato especial para el count -->
            <template v-slot:item.count="{ value }">
              <v-chip color="primary" size="small" variant="flat">
                <span class="crud-group-by-dialog__count-value">
                {{ value }}
                </span>
              </v-chip>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
</style>
