<script setup lang="ts">
  import { onMounted, computed } from 'vue';

  const props = defineProps<{
    loading: boolean,
    actions: {name: string, color: string}[]
    data: {entity: string, actions: {name: string, value: number}[]}[]
  }>()
    
    const barWidth = 40;
    const barGap = 5;
    
    const maxValue = computed(() => Math.max(...props.data.flatMap(item => item.actions.map(action => action.value))));
    const valuesY = computed(() => Array.from({ length: 5 }, (_, i) => Math.round((maxValue.value / 5) * i)));
    valuesY.value.sort((a, b) => b - a);

    const calcHeight = computed(() => (value: number): string => {
      return `${(value / maxValue.value) * 100}%`;
    })

    const calcWidth = computed(() => (entity: { actions: Array<{ name: string, value: number }> }): string => {
      return `${(barWidth + barGap) * entity.actions.length + 20}px`;
    })

    const getColor = computed(() => (actionName: string): string => {
      return props.actions.find(a => a.name === actionName)?.color || 'grey';
    })

    function showTooltip(e: MouseEvent, text: string) {
      const element = document.getElementById('bar-tooltip')
      if (element) {
        element.innerText = text
        element.style.display = 'block'
      }
    }

    function hideTooltip() {
      const element = document.getElementById('bar-tooltip')
      if (element) element.style.display = 'none'
    }

    function moveTooltip(e: MouseEvent) {
      const element = document.getElementById('bar-tooltip')
      if (element) {
        element.style.left = `${e.clientX + 10}px`
        element.style.top = `${e.clientY + 10}px`
      }
    }

    onMounted(() => {
      const tooltip = document.getElementById('bar-tooltip')
      if (tooltip) document.body.appendChild(tooltip)
    })

  const entities = [
    'Usuario', 'Producto', 'Campaña', 'Categoría', 'Tienda', 'Subcategoría',
    'Usuario', 'Producto', 'Campaña', 'Categoría', 'Tienda', 'Subcategoría',
    'Usuario', 'Producto', 'Campaña', 'Categoría', 'Tienda', 'Subcategoría',
    'Usuario', 'Producto', 'Campaña', 'Categoría', 'Tienda', 'Subcategoría'
  ]
</script>

<template>
  <div id="bar-tooltip" style="
    position: fixed;
    background: black;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    display: none;
    pointer-events: none;
  "></div>
  <v-card variant="text" height="430" class="pt-4">
    <template v-if="props.loading">
      <v-card variant="text" height="430" class="d-flex align-center justify-center">
        <v-progress-circular indeterminate color="primary" size="50"></v-progress-circular>
      </v-card>
    </template>
    <template v-else>
      <v-card variant="text" style="position: absolute; left: 10px; height: calc(100% - 100px);" width="50px" class="d-flex flex-column justify-space-between align-start">
        <span v-for="value of valuesY" :key="value" class="text-caption" style="width: 25px;">{{ value }}</span>
      </v-card>
      <v-card variant="text" style="position: absolute; left: 50px; width: calc(100% - 10px); height: calc(100% - 100px);" class="d-flex flex-column justify-space-between">
        <v-divider class="pb-2" v-for="value of valuesY" :key="value" style="width: calc(100% - 55px);"></v-divider>
      </v-card>
      <v-card variant="text" style="position: absolute; left: 50px; width: calc(100% + 10px); height: 100%;">
        <v-card variant="text" class="d-flex justify-space-around ga-4" style="height: calc(100% - 15px); flex-shrink: 0; width: calc(100% - 80px); overflow-x: auto">
          <v-card variant="text" class="d-flex flex-column" style="flex-shrink: 0; overflow: visible !important;">
            <v-card variant="text" class="d-flex justify-space-around ga-4" style="height: calc(100% - 95px); flex-shrink: 0; ">
              <v-card 
                v-for="entity of props.data"
                color="blue"
                @click=""
                @mouseenter="showTooltip($event, entity.entity)"
                @mouseleave="hideTooltip"
                @mousemove="moveTooltip($event)"
                variant="text" class="d-flex align-end justify-center" :style="{width: `${entity.actions.length * barWidth}px`, flexShrink: 0}">
                <v-card
                  v-for="action of entity.actions" 
                  :key="action.name"
                  :style="{bottom: 0, width: `${barWidth}px`, height: calcHeight(action.value), backgroundColor: getColor(action.name)}"
                ></v-card>
              </v-card>
            </v-card>
            <v-card variant="text" class="d-flex justify-space-around ga-4" style="min-width: calc(100% - 55px); height: 80px; flex-shrink: 0; overflow: visible !important;">
              <v-card 
                v-for="entity of props.data"
                variant="text" class="d-flex align-center justify-center" :style="{width: `45px`, height: `70px`, overflow: 'visible !important', flexShrink: 0}"
              >
                <span class="text-caption" style="transform: rotate(15deg)">{{ entity.entity }}</span>
              </v-card>
            </v-card>
          </v-card>
        </v-card>
      </v-card>
    </template>
  </v-card>
</template>