<script setup lang="ts">
import type {PropType} from "vue";
import {computed, ref, onMounted, onUnmounted, watch} from "vue";
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

const canvasRef = ref<HTMLCanvasElement | null>(null)

// Paleta de colores para el gráfico
const colors = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
  '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF9F40',
  '#36A2EB', '#FFCE56', '#9966FF', '#FF6384', '#4BC0C0'
]

const truncateLabel = (label: string, maxLength = 18) => {
  if (!label) return 'N/A'
  return label.length > maxLength ? `${label.slice(0, maxLength)}…` : label
}

const getContrastColor = (hexColor: string) => {
  const hex = hexColor.replace('#', '')
  const r = Number.parseInt(hex.substring(0, 2), 16)
  const g = Number.parseInt(hex.substring(2, 4), 16)
  const b = Number.parseInt(hex.substring(4, 6), 16)
  const luminance = (0.299 * r) + (0.587 * g) + (0.114 * b)

  return luminance > 186 ? '#1f2937' : '#ffffff'
}

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

      if (['ref','object'].includes(field.type) && field.refDisplay && value) {
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
      shortLabel: truncateLabel(label),
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

  const parentWidth = canvas.parentElement?.clientWidth || 420
  const width = Math.min(parentWidth, 520)
  const height = 300

  canvas.width = width
  canvas.height = height

  const centerX = width / 2
  const centerY = height / 2
  const radius = Math.min(width * 0.24, height * 0.34)
  const labelRadius = radius + 16
  const labelOffset = 22
  const donutRadius = radius * 0.45

  ctx.clearRect(0, 0, width, height)
  ctx.textBaseline = 'middle'

  let currentAngle = -Math.PI / 2

  chartData.value.forEach((segment) => {
    const sliceAngle = (segment.percentage / 100) * 2 * Math.PI
    const endAngle = currentAngle + sliceAngle
    const midAngle = currentAngle + (sliceAngle / 2)

    // Segmento
    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.arc(centerX, centerY, radius, currentAngle, endAngle)
    ctx.closePath()
    ctx.fillStyle = segment.color
    ctx.fill()

    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2
    ctx.stroke()

    // Porcentaje dentro del segmento
    if (segment.percentage >= 4) {
      const textRadius = radius * 0.68
      const textX = centerX + Math.cos(midAngle) * textRadius
      const textY = centerY + Math.sin(midAngle) * textRadius

      ctx.fillStyle = getContrastColor(segment.color)
      ctx.font = 'bold 12px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(`${segment.percentage.toFixed(1)}%`, textX, textY)
    }

    // Label al costado con línea guía
    const lineStartX = centerX + Math.cos(midAngle) * radius
    const lineStartY = centerY + Math.sin(midAngle) * radius
    const lineMidX = centerX + Math.cos(midAngle) * labelRadius
    const lineMidY = centerY + Math.sin(midAngle) * labelRadius
    const isRightSide = Math.cos(midAngle) >= 0
    const lineEndX = lineMidX + (isRightSide ? labelOffset : -labelOffset)
    const lineEndY = lineMidY

    ctx.beginPath()
    ctx.moveTo(lineStartX, lineStartY)
    ctx.lineTo(lineMidX, lineMidY)
    ctx.lineTo(lineEndX, lineEndY)
    ctx.strokeStyle = segment.color
    ctx.lineWidth = 1.5
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(lineEndX, lineEndY, 2.5, 0, 2 * Math.PI)
    ctx.fillStyle = segment.color
    ctx.fill()

    ctx.fillStyle = '#374151'
    ctx.font = '500 12px sans-serif'
    ctx.textAlign = isRightSide ? 'left' : 'right'
    ctx.fillText(
      segment.shortLabel,
      lineEndX + (isRightSide ? 6 : -6),
      lineEndY
    )

    currentAngle = endAngle
  })

  // Centro blanco para efecto donut
  ctx.beginPath()
  ctx.arc(centerX, centerY, donutRadius, 0, 2 * Math.PI)
  ctx.fillStyle = '#ffffff'
  ctx.fill()

  // Total al centro
  ctx.fillStyle = '#6b7280'
  ctx.font = '500 11px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('Total', centerX, centerY - 8)

  ctx.fillStyle = '#111827'
  ctx.font = 'bold 16px sans-serif'
  ctx.fillText(String(totalCount.value), centerX, centerY + 10)
}

// Redibujar cuando cambien los datos
watch(chartData, () => {
  setTimeout(drawPieChart, 100)
}, { deep: true })

onMounted(() => {
  drawPieChart()
  window.addEventListener('resize', drawPieChart)
})

onUnmounted(() => {
  window.removeEventListener('resize', drawPieChart)
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
  padding: 8px 4px;
  width: 100%;
  overflow-x: auto;
}

.chart-wrapper canvas {
  width: 100%;
  max-width: 520px;
  height: 300px;
  display: block;
}
</style>
