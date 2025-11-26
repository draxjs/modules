<script setup lang="ts">
import type {PropType} from "vue";
import {computed} from "vue";
import {useDateFormat} from "@drax/common-vue"
import type {IDraxDateFormatUnit} from "@drax/common-share";
import type {IEntityCrudField} from "@drax/crud-share";

const {formatDateByUnit} = useDateFormat()

const {data,  fields, dateFormat} = defineProps({
  data: {type: Array as PropType<any[]>, required: false},
  headers: {type: Array as PropType<any[]>, required: false},
  fields: {type: Array as PropType<IEntityCrudField[]>, required: false},
  dateFormat: {type: String as PropType<IDraxDateFormatUnit>, required: false, default:'day'},
})

// Paleta de colores para las tarjetas
const colors = [
  'purple', 'indigo', 'teal', 'orange', 'pink',
  'cyan', 'lime', 'amber', 'deep-purple', 'light-blue',
  'deep-orange', 'blue-grey', 'brown', 'red', 'green'
]

// Calcular el total de todos los counts
const totalCount = computed(() => {
  if (!data || data.length === 0) return 0
  return data.reduce((sum, item) => sum + (item.count || 0), 0)
})

// Preparar datos para las tarjetas
const cardData = computed(() => {
  if (!data || data.length === 0) return []

  return data.map((item, index) => {
    const percentage = totalCount.value > 0 ? (item.count / totalCount.value) * 100 : 0

    // Obtener el label combinando todos los campos excepto count
    const labelParts: string[] = []

    // Iterar sobre las claves del item excepto count
    Object.keys(item).forEach(key => {
      if (key === 'count') return

      // Buscar el campo correspondiente en fields
      const field = fields?.find(f => f.name === key)
      const value = item[key]

      if (!field || value === null || value === undefined) return

      let formattedValue = ''

      if (field.type === 'ref' && field.refDisplay && value) {
        formattedValue = value[field.refDisplay]
      } else if (field.type === 'date' && value) {
        formattedValue = formatDateByUnit(value, dateFormat)
      } else if (field.type === 'enum' && value) {
        formattedValue = value.toString()
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        formattedValue = JSON.stringify(value)
      } else {
        formattedValue = value?.toString() || ''
      }

      if (formattedValue) {
        labelParts.push(formattedValue)
      }
    })

    const label = labelParts.length > 0 ? labelParts.join(' - ') : 'N/A'

    return {
      label,
      value: item.count || 0,
      percentage,
      color: colors[index % colors.length]
    }
  })
})
</script>

<template>
  <div class="gallery-container">
    <div v-if="!data || data.length === 0" class="empty-state">
      <v-icon size="64" color="grey-lighten-1">mdi-view-grid</v-icon>
      <p class="text-grey-lighten-1 mt-4">No hay datos para mostrar</p>
    </div>

    <template v-else>
      <v-row dense class="ma-0">
        <v-col
            v-for="(card, index) in cardData"
            :key="index"
            cols="6"
            sm="4"
            md="3"
            lg="2"
            class="pa-1"
        >
          <v-card
              :color="card.color"
              variant="tonal"
              class="gallery-card"
              hover
          >
            <v-card-text class="pa-2">
              <div class="d-flex flex-column align-center text-center">
                <div class="card-value text-h5 font-weight-bold mb-1">
                  {{ card.value }}
                </div>
                <div class="card-label text-caption text-truncate" :title="card.label">
                  {{ card.label }}
                </div>
                <v-chip
                    :color="card.color"
                    size="x-small"
                    variant="flat"
                    class="mt-1"
                >
                  {{ card.percentage.toFixed(1) }}%
                </v-chip>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-divider class="my-2"></v-divider>

      <div class="total-section pa-2">
        <v-card variant="flat" color="grey-lighten-4">
          <v-card-text class="pa-2 d-flex align-center justify-space-between">
            <span class="text-subtitle-2 font-weight-bold">Total</span>
            <v-chip color="primary" size="small" variant="flat">
              {{ totalCount }}
            </v-chip>
          </v-card-text>
        </v-card>
      </div>
    </template>
  </div>
</template>

<style scoped>
.gallery-container {
  width: 100%;
  padding: 4px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  min-height: 200px;
}

.gallery-card {
  height: 100%;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.gallery-card:hover {
  transform: translateY(-2px);
}

.card-value {
  line-height: 1.2;
}

.card-label {
  width: 100%;
  line-height: 1.2;
  max-width: 100%;
}

.total-section {
  padding: 0 4px;
}
</style>
