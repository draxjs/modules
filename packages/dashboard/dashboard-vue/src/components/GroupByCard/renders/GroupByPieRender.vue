<script setup lang="ts">
import type {PropType} from "vue";
import {computed, ref, onMounted, watch} from "vue";
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

const canvasRef = ref<HTMLCanvasElement | null>(null)

// Paleta de colores para el gráfico
const colors = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
  '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF9F40',
  '#36A2EB', '#FFCE56', '#9966FF', '#FF6384', '#4BC0C0'
]

// Calcular el total de todos los counts
const totalCount = computed(() => {
  if (!data || data.length === 0) return 0
  return data.reduce((sum, item) => sum + (item.count || 0), 0)
})

// Preparar datos para el gráfico
const chartData = computed(() => {
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

// Dibujar el gráfico de torta
const drawPieChart = () => {
  if (!canvasRef.value || chartData.value.length === 0) return

  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Configurar el tamaño del canvas
  const size = Math.min(canvas.parentElement?.clientWidth || 400, 400)
  canvas.width = size
  canvas.height = size

  const centerX = size / 2
  const centerY = size / 2
  const radius = (size / 2) * 0.7

  // Limpiar el canvas
  ctx.clearRect(0, 0, size, size)

  // Dibujar cada segmento
  let currentAngle = -Math.PI / 2 // Comenzar desde arriba

  chartData.value.forEach((segment) => {
    const sliceAngle = (segment.percentage / 100) * 2 * Math.PI

    // Dibujar el segmento
    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle)
    ctx.closePath()
    ctx.fillStyle = segment.color
    ctx.fill()

    // Dibujar borde blanco
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2
    ctx.stroke()

    currentAngle += sliceAngle
  })

  // Dibujar círculo blanco en el centro para efecto "donut" (opcional)
  ctx.beginPath()
  ctx.arc(centerX, centerY, radius * 0.5, 0, 2 * Math.PI)
  ctx.fillStyle = '#ffffff'
  ctx.fill()
}

// Redibujar cuando cambien los datos
watch(() => data, () => {
  setTimeout(drawPieChart, 100)
}, { deep: true })

onMounted(() => {
  drawPieChart()

  // Redibujar al cambiar el tamaño de la ventana
  window.addEventListener('resize', drawPieChart)
})
</script>

<template>
  <div class="pie-chart-container">
    <div v-if="!data || data.length === 0" class="empty-state">
      <v-icon size="64" color="grey-lighten-1">mdi-chart-pie</v-icon>
      <p class="text-grey-lighten-1 mt-4">No hay datos para mostrar</p>
    </div>

    <template v-else>
      <div class="chart-wrapper">
        <canvas ref="canvasRef"></canvas>
      </div>

      <div class="legend-container">
        <div
            v-for="(segment, index) in chartData"
            :key="index"
            class="legend-item"
        >
          <div class="legend-color" :style="{ backgroundColor: segment.color }"></div>
          <div class="legend-content">
            <div class="legend-label">{{ segment.label }}</div>
            <div class="legend-stats">
              <v-chip color="primary" size="x-small" variant="flat">
                {{ segment.value }}
              </v-chip>
              <span class="legend-percentage">{{ segment.percentage.toFixed(1) }}%</span>
            </div>
          </div>
        </div>
      </div>

      <div class="total-container">
        <v-divider class="my-1"></v-divider>
        <div class="d-flex align-center justify-space-between">
          <span class="text-subtitle-1 font-weight-medium ml-2">Total</span>
          <v-chip color="primary" variant="flat">
            {{ totalCount }}
          </v-chip>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.pie-chart-container {
  padding: 2px;
  width: 100%;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4px 2px;
}

.chart-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 2px;
  padding: 2px;
}

.chart-wrapper canvas {
  max-width: 200px;
  max-height: 180px;
  height: auto;
}

.legend-container {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 200px;
  overflow-y: auto;
  padding: 2px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 2px 4px;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.legend-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  flex-shrink: 0;
}

.legend-content {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 6px;
}

.legend-label {
  font-size: 13px;
  font-weight: 500;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.legend-stats {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-percentage {
  font-size: 11px;
  color: rgba(0, 0, 0, 0.6);
  font-weight: 500;
  min-width: 40px;
  text-align: right;
}

.total-container {
  margin-top: 8px;
}

/* Scrollbar personalizado para la leyenda */
.legend-container::-webkit-scrollbar {
  width: 4px;
}

.legend-container::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 2px;
}

.legend-container::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
}

.legend-container::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}
</style>
