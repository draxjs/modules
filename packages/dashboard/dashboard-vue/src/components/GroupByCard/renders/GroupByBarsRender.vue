<script setup lang="ts">
import type {PropType} from "vue";
import {computed, ref, onMounted, watch} from "vue";
import {useDateFormat} from "@drax/common-vue"
import type {IDraxDateFormatUnit} from "@drax/common-share";
import type {IEntityCrudField} from "@drax/crud-share";

const {formatDateByUnit} = useDateFormat()

const {data, headers, fields, dateFormat, showLegend} = defineProps({
  data: {type: Array as PropType<any[]>, required: false},
  headers: {type: Array as PropType<any[]>, required: false},
  fields: {type: Array as PropType<IEntityCrudField[]>, required: false},
  dateFormat: {type: String as PropType<IDraxDateFormatUnit>, required: false, default:'day'},
  showLegend: {type: Boolean, default: true},
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

// Calcular el valor máximo para escalar las barras
const maxValue = computed(() => {
  if (!data || data.length === 0) return 0
  return Math.max(...data.map(item => item.count || 0))
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

// Dibujar el gráfico de barras
const drawBarChart = () => {
  if (!canvasRef.value || chartData.value.length === 0) return

  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Configurar el tamaño del canvas
  const containerWidth = canvas.parentElement?.clientWidth || 400
  const containerHeight = 300
  canvas.width = containerWidth
  canvas.height = containerHeight

  const padding = { top: 20, right: 20, bottom: 60, left: 60 }
  const chartWidth = containerWidth - padding.left - padding.right
  const chartHeight = containerHeight - padding.top - padding.bottom

  // Limpiar el canvas
  ctx.clearRect(0, 0, containerWidth, containerHeight)

  // Calcular el ancho de cada barra
  const barWidth = chartWidth / chartData.value.length
  const barPadding = barWidth * 0.2

  // Dibujar el eje Y (valores)
  ctx.strokeStyle = '#e0e0e0'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(padding.left, padding.top)
  ctx.lineTo(padding.left, padding.top + chartHeight)
  ctx.stroke()

  // Dibujar el eje X (categorías)
  ctx.beginPath()
  ctx.moveTo(padding.left, padding.top + chartHeight)
  ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight)
  ctx.stroke()

  // Dibujar líneas de referencia horizontales
  const numGridLines = 5
  ctx.strokeStyle = '#f5f5f5'
  ctx.lineWidth = 1
  ctx.font = '10px sans-serif'
  ctx.fillStyle = '#666'
  ctx.textAlign = 'right'

  for (let i = 0; i <= numGridLines; i++) {
    const y = padding.top + (chartHeight / numGridLines) * i
    const value = Math.round(maxValue.value * (1 - i / numGridLines))

    // Línea de referencia
    ctx.beginPath()
    ctx.moveTo(padding.left, y)
    ctx.lineTo(padding.left + chartWidth, y)
    ctx.stroke()

    // Etiqueta del valor
    ctx.fillText(value.toString(), padding.left - 10, y + 4)
  }

  // Dibujar las barras
  chartData.value.forEach((segment, index) => {
    const x = padding.left + (barWidth * index) + barPadding / 2
    const barHeight = (segment.value / maxValue.value) * chartHeight
    const y = padding.top + chartHeight - barHeight

    // Dibujar la barra
    ctx.fillStyle = segment.color
    ctx.fillRect(x, y, barWidth - barPadding, barHeight)

    // Dibujar borde de la barra
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2
    ctx.strokeRect(x, y, barWidth - barPadding, barHeight)

    // Dibujar el valor encima de la barra
    ctx.fillStyle = '#333'
    ctx.font = 'bold 11px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(
        segment.value.toString(),
        x + (barWidth - barPadding) / 2,
        y - 5
    )

    // Dibujar etiqueta del eje X (rotada si es necesario)
    ctx.save()
    ctx.translate(x + (barWidth - barPadding) / 2, padding.top + chartHeight + 10)
    ctx.rotate(-Math.PI / 4)
    ctx.fillStyle = '#666'
    ctx.font = '10px sans-serif'
    ctx.textAlign = 'right'

    // Truncar label si es muy largo
    const maxLabelLength = 15
    const label = segment.label.length > maxLabelLength
        ? segment.label.substring(0, maxLabelLength) + '...'
        : segment.label

    ctx.fillText(label, 0, 0)
    ctx.restore()
  })
}

// Redibujar cuando cambien los datos
watch(() => data, () => {
  setTimeout(drawBarChart, 100)
}, { deep: true })

onMounted(() => {
  drawBarChart()

  // Redibujar al cambiar el tamaño de la ventana
  window.addEventListener('resize', drawBarChart)
})
</script>

<template>
  <div class="bar-chart-container">
    <div v-if="!data || data.length === 0" class="empty-state">
      <v-icon size="64" color="grey-lighten-1">mdi-chart-bar</v-icon>
      <p class="text-grey-lighten-1 mt-4">No hay datos para mostrar</p>
    </div>

    <template v-else>
      <div class="chart-wrapper">
        <canvas ref="canvasRef"></canvas>
      </div>

      <div v-if="showLegend" class="legend-container">
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

      <div v-if="showLegend" class="total-container">
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
.bar-chart-container {
  padding: 2px;
  margin-top: 6px;
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
  width: 100%;
}

.chart-wrapper canvas {
  height:  100%;
}

.legend-container {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 120px;
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
