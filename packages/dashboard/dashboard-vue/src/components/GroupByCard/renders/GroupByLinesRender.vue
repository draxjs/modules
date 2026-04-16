<script setup lang="ts">
import type {PropType} from "vue";
import {computed, ref, onMounted, onUnmounted, watch} from "vue";
import {useDateFormat} from "@drax/common-vue"
import type {IDraxDateFormatUnit} from "@drax/common-share";
import type {IEntityCrudField} from "@drax/crud-share";

const {formatDateByUnit} = useDateFormat()

const {data, fields, dateFormat} = defineProps({
  data: {type: Array as PropType<any[]>, required: false},
  headers: {type: Array as PropType<any[]>, required: false},
  fields: {type: Array as PropType<IEntityCrudField[]>, required: false},
  dateFormat: {type: String as PropType<IDraxDateFormatUnit>, required: false, default: 'day'},
  showLegend: {type: Boolean, default: true},
})

const canvasRef = ref<HTMLCanvasElement | null>(null)

const colors = [
  '#2563eb', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#14b8a6'
]

const isNumericValue = (value: unknown) => typeof value === 'number' && Number.isFinite(value)

const formatFieldValue = (fieldName: string, value: any) => {
  const field = fields?.find((item) => item.name === fieldName)

  if (value === null || value === undefined) return 'N/A'

  if (field?.type === 'date') {
    return formatDateByUnit(value, dateFormat)
  }

  if (['ref', 'object'].includes(field?.type || '') && field?.refDisplay && value) {
    return value[field.refDisplay] || 'N/A'
  }

  if (typeof value === 'object' && !Array.isArray(value)) {
    return JSON.stringify(value)
  }

  return String(value)
}

const xField = computed(() => {
  if (!data?.length) return null

  const sample = data.find((item) => item && typeof item === 'object')
  if (!sample) return null

  return Object.keys(sample).find((key) => key !== 'count' && !isNumericValue(sample[key])) || null
})

const xFieldConfig = computed(() => {
  if (!xField.value) return null
  return fields?.find((field) => field.name === xField.value) || null
})

const seriesKeys = computed(() => {
  if (!data?.length) return ['count']

  const sample = data.find((item) => item && typeof item === 'object')
  if (!sample) return ['count']

  const keys = Object.keys(sample).filter((key) => key !== xField.value && isNumericValue(sample[key]))
  return keys.length > 0 ? keys : ['count']
})

const seriesMeta = computed(() => {
  return seriesKeys.value.map((key, index) => {
    const field = fields?.find((item) => item.name === key)

    return {
      key,
      label: field?.label || key,
      color: colors[index % colors.length]
    }
  })
})

const buildItemLabel = (item: Record<string, any>) => {
  const labelParts: string[] = []

  Object.keys(item).forEach((key) => {
    if (seriesKeys.value.includes(key)) return

    const formattedValue = formatFieldValue(key, item[key])

    if (formattedValue && formattedValue !== 'N/A') {
      labelParts.push(formattedValue)
    }
  })

  return labelParts.length > 0 ? labelParts.join(' - ') : 'N/A'
}

const chartData = computed(() => {
  if (!data?.length || !xField.value) return []

  const normalized = data.map((item, index) => {
    const rawX = item?.[xField.value as string]
    const xLabel = formatFieldValue(xField.value as string, rawX)
    const fullLabel = buildItemLabel(item)
    const xValue = xFieldConfig.value?.type === 'date' && rawX ? new Date(rawX).getTime() : index

    const seriesValues = Object.fromEntries(
      seriesMeta.value.map((series) => [series.key, Number(item?.[series.key] || 0)])
    )

    return {
      rawX,
      xLabel,
      fullLabel,
      xValue,
      seriesValues
    }
  })

  return normalized.sort((left, right) => {
    if (xFieldConfig.value?.type === 'date') {
      return left.xValue - right.xValue
    }

    return left.xLabel.localeCompare(right.xLabel, undefined, {numeric: true, sensitivity: 'base'})
  })
})

const maxValue = computed(() => {
  if (!chartData.value.length) return 0

  const values = chartData.value.flatMap((item) => seriesMeta.value.map((series) => item.seriesValues[series.key] || 0))
  return Math.max(...values, 0)
})

const yAxisTicks = computed(() => {
  const steps = 5
  const currentMax = maxValue.value

  if (currentMax <= 0) {
    return [0, 1, 2, 3, 4, 5]
  }

  return Array.from({length: steps + 1}, (_, index) => {
    return (currentMax / steps) * index
  })
})

const drawLineChart = () => {
  if (!canvasRef.value || !chartData.value.length || !xField.value) return

  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const parentWidth = canvas.parentElement?.clientWidth || 640
  const width = parentWidth
  const height = 340
  const padding = {top: 24, right: 24, bottom: 72, left: 56}

  canvas.width = width
  canvas.height = height

  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  ctx.clearRect(0, 0, width, height)
  ctx.textBaseline = 'middle'

  yAxisTicks.value.forEach((tick) => {
    const y = padding.top + chartHeight - ((tick / Math.max(maxValue.value, 5)) * chartHeight)

    ctx.beginPath()
    ctx.moveTo(padding.left, y)
    ctx.lineTo(padding.left + chartWidth, y)
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 1
    ctx.stroke()

    ctx.fillStyle = '#6b7280'
    ctx.font = '11px sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText(Number.isInteger(tick) ? String(tick) : tick.toFixed(1), padding.left - 8, y)
  })

  ctx.beginPath()
  ctx.moveTo(padding.left, padding.top)
  ctx.lineTo(padding.left, padding.top + chartHeight)
  ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight)
  ctx.strokeStyle = '#9ca3af'
  ctx.lineWidth = 1.25
  ctx.stroke()

  const getPointX = (index: number) => {
    if (chartData.value.length === 1) return padding.left + (chartWidth / 2)
    return padding.left + ((chartWidth / (chartData.value.length - 1)) * index)
  }

  const getPointY = (value: number) => {
    const safeMax = Math.max(maxValue.value, 5)
    return padding.top + chartHeight - ((value / safeMax) * chartHeight)
  }

  seriesMeta.value.forEach((series) => {
    ctx.beginPath()

    chartData.value.forEach((item, index) => {
      const x = getPointX(index)
      const y = getPointY(item.seriesValues[series.key] || 0)

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.strokeStyle = series.color
    ctx.lineWidth = 2.5
    ctx.stroke()

    chartData.value.forEach((item, index) => {
      const x = getPointX(index)
      const y = getPointY(item.seriesValues[series.key] || 0)
      const valueLabel = String(item.seriesValues[series.key] || 0)

      ctx.beginPath()
      ctx.arc(x, y, 4, 0, 2 * Math.PI)
      ctx.fillStyle = '#ffffff'
      ctx.fill()
      ctx.lineWidth = 2
      ctx.strokeStyle = series.color
      ctx.stroke()

      ctx.fillStyle = series.color
      ctx.font = '11px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(valueLabel, x, y - 12)
    })
  })

  chartData.value.forEach((item, index) => {
    const x = getPointX(index)

    ctx.beginPath()
    ctx.moveTo(x, padding.top + chartHeight)
    ctx.lineTo(x, padding.top + chartHeight + 6)
    ctx.strokeStyle = '#9ca3af'
    ctx.lineWidth = 1
    ctx.stroke()

    ctx.save()
    ctx.translate(x, padding.top + chartHeight + 18)
    ctx.rotate(-Math.PI / 4)
    ctx.fillStyle = '#4b5563'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'right'
    const maxLabelLength = 36
    const label = item.fullLabel.length > maxLabelLength
      ? `${item.fullLabel.slice(0, maxLabelLength)}...`
      : item.fullLabel
    ctx.fillText(label, 0, 0)
    ctx.restore()
  })
}

watch(chartData, () => {
  setTimeout(drawLineChart, 100)
}, {deep: true})

onMounted(() => {
  drawLineChart()
  window.addEventListener('resize', drawLineChart)
})

onUnmounted(() => {
  window.removeEventListener('resize', drawLineChart)
})
</script>

<template>
  <div class="line-chart-container">
    <div v-if="!data || data.length === 0" class="empty-state">
      <v-icon size="64" color="grey-lighten-1">mdi-chart-line</v-icon>
      <p class="text-grey-lighten-1 mt-4">No hay datos para mostrar</p>
    </div>

    <div v-else-if="!xField" class="empty-state">
      <v-icon size="64" color="grey-lighten-1">mdi-axis-x-arrow</v-icon>
      <p class="text-grey-lighten-1 mt-4">Se necesita al menos un campo categórico o de fecha para el eje X</p>
    </div>

    <template v-else>
      <div class="chart-wrapper">
        <canvas ref="canvasRef"></canvas>
      </div>

    </template>
  </div>
</template>

<style scoped>
.line-chart-container {
  width: 100%;
  min-height: 360px;
}

.chart-wrapper {
  position: relative;
  width: 100%;
  min-height: 340px;
  overflow-x: auto;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  text-align: center;
}
</style>
