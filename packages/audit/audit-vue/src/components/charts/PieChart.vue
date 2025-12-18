<template>
  <v-card class="chart-container" height="415" variant="text">
    <template v-if="props.loading">
      <v-card variant="text" height="415" class="d-flex align-center justify-center">
        <v-progress-circular indeterminate color="primary" size="50"></v-progress-circular>
      </v-card>
    </template>
    <template v-else-if="!props.data || !props.data.length">
      <v-card variant="text" height="415" class="d-flex align-center justify-center">
        <v-icon icon="mdi-alert" start></v-icon>No se realizaron acciones
      </v-card>
    </template>
    <template v-else>
      <div style="position: absolute; top: 0; left: 47px; width: 90%; height: calc(100% - 35px);" class="d-flex justify-center">
        <div id="pie-tooltip" style="
          position: fixed;
          background: black;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          display: none;
          pointer-events: none;
        "></div>
        <svg viewBox="0 0 60 60">
          <path 
            v-for="(pie, index) of pieBuilder()"
            :style="{ fill: pie.color }"
            :d="createSlicePath(30, 30, 25, pie.startAngle, pie.endAngle)"
            @mouseenter="showTooltip($event, `${pie.action}: ${pie.percentage.toFixed(2)}%`)"
            @mouseleave="hideTooltip"
            @mousemove="moveTooltip($event)"
          >
          </path>
        </svg>
      </div>
    </template>
  </v-card>
</template>

<script setup lang="ts">
  const props = defineProps<{loading: boolean, data: {action: string; percentage: number; color: string}[]}>()

  const pieBuilder = (): { action: string; color: string; percentage: number, startAngle: number; endAngle: number }[] => {
    const pie: { action: string; color: string; percentage: number, startAngle: number; endAngle: number }[] = [];
    
    let initialAngle = 0;

    props.data.forEach(({action, percentage, color}, index) => {
      let endAngle = initialAngle + calculateEndAngle(percentage);
      endAngle = index === props.data.length - 1 ? 359.9 : endAngle;
      pie.push({ action, color, percentage, startAngle: initialAngle, endAngle });
      initialAngle = endAngle
    })

    return pie;
  }

  const calculateEndAngle = (percentage: number) => (percentage / 100) * 360;

  function createSlicePath(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);

    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

    return [
      `M ${cx} ${cy}`,
      `L ${start.x} ${start.y}`,
      `A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
      "Z"
    ].join(" ");
  }

  function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number): { x: number; y: number } {
    const angleRad = (angleDeg - 90) * Math.PI / 180.0;
    return {
      x: cx + r * Math.cos(angleRad),
      y: cy + r * Math.sin(angleRad)
    };
  }

  function showTooltip(e: MouseEvent, text: string) {
    const element = document.getElementById('pie-tooltip')
    if (element) {
      element.innerText = text
      element.style.display = 'block'
    }
  }

  function hideTooltip() {
    const element = document.getElementById('pie-tooltip')
    if (element) element.style.display = 'none'
  }

  function moveTooltip(e: MouseEvent) {
    const element = document.getElementById('pie-tooltip')
    if (element) {
      element.style.left = `${e.clientX + 10}px`
      element.style.top = `${e.clientY + 10}px`
    }
  }

</script>
