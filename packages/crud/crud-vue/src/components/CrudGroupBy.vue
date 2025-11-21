<script setup lang="ts">
import type { PropType } from 'vue'
import { ref, computed } from 'vue'
import type { IEntityCrud } from "@drax/crud-share"
import { useI18n } from "vue-i18n"

const { t, te } = useI18n()

const props = defineProps({
  entity: { type: Object as PropType<IEntityCrud>, required: true },
  groupByData: { type: Array as PropType<Array<Record<string, any>>>, default: () => [] },
  selectedFields: { type: Array as PropType<string[]>, default: () => [] }
})

const emit = defineEmits(['close'])

// Generar headers dinámicamente basados en los campos seleccionados
const headers = computed(() => {
  if (!props.groupByData.length || !props.selectedFields.length) return []

  const fieldHeaders = props.selectedFields.map(field => {
    const entityField = props.entity.fields.find(f => f.name === field)
    const label = entityField?.label || field

    return {
      title: te(`${props.entity.name.toLowerCase()}.field.${label}`)
        ? t(`${props.entity.name.toLowerCase()}.field.${label}`)
        : label,
      key: field,
      align: 'start' as const
    }
  })

  return [
    ...fieldHeaders,
    {
      title: t('crud.groupby.count'),
      key: 'count',
      align: 'end' as const
    }
  ]
})

// Calcular total de registros
const totalCount = computed(() => {
  return props.groupByData.reduce((sum, item) => sum + (item.count || 0), 0)
})
</script>

<template>
  <v-card v-if="groupByData.length > 0" class="mb-4">
    <v-card-title class="d-flex align-center">
      <v-icon class="mr-2">mdi-chart-bar</v-icon>
      {{ t('crud.groupby.title') }}
      <v-spacer></v-spacer>
      <v-chip color="primary" variant="flat" class="mr-2">
        {{ t('crud.groupby.total') }}: {{ totalCount }}
      </v-chip>
      <v-btn
        icon
        variant="text"
        size="small"
        @click="emit('close')"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-card-title>

    <v-divider></v-divider>

    <v-card-text>
      <v-data-table
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
          :key="field"
          v-slot:[`item.${field}`]="{ value }"
        >
          <slot :name="`groupby.${field}`" v-bind="{ value }">
            {{ value || t('crud.groupby.empty') }}
          </slot>
        </template>

        <!-- Formato especial para el count -->
        <template v-slot:item.count="{ value }">
          <v-chip color="primary" size="small" variant="flat">
            {{ value }}
          </v-chip>
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</template>

<style scoped>
</style>
