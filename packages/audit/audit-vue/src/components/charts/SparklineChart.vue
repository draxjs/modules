<script setup lang="ts">
    import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
    import {  } from '@drax/common-vue'
    import { useDisplay } from 'vuetify';

    const labels = ['00:00','04:00','08:00','12:00','16:00','20:00']

    const props = defineProps<{values: number[]}>()

    const maxValue = computed(() => props.values ? Math.max(...props.values) : 0)

    const valuesY = computed(() => Array.from({ length: 6 }, (_, i) => Math.ceil((maxValue.value / 5) * i)));
    valuesY.value.sort((a, b) => b - a);

    const svg = ref()
    const card = ref()

    let observer: ResizeObserver

    const cardWidth = ref(0)

    onMounted(() => {
        observer = new ResizeObserver(entries => {
            for (const entry of entries) {
                cardWidth.value = entry.contentRect.width
            }
        })

        if (card.value) {
            observer.observe(card.value)
        }

        const tooltip = document.getElementById('sparkline-tooltip')
        if (tooltip) document.body.appendChild(tooltip)
    })

    onBeforeUnmount(() => {
        if (observer && card.value) observer.unobserve(card.value)
    })

    const { width } = useDisplay()

    const calculateCircleX = computed(() => (index: number) => {
        const svgWidth = svg.value?.getBoundingClientRect().width
        const result = cardWidth.value && width.value ? (index - 1) * (svgWidth / 6) + 5 : 0;
        return isNaN(result) ? 0 : result
    })

    const calculateCricleYByIndexAndValue = computed(() => (index: number) => {
        const svgHeight = svg.value?.getBoundingClientRect().height
        const result = cardWidth.value && width.value ? svgHeight - ((svgHeight - 15) / maxValue.value) * props.values[index - 1] : 0;
        return isNaN(result) ? 0 : result - 5
    })

    const valueOnHover = ref<number | undefined>(undefined)

    function showTooltip(e: MouseEvent, text: string, value: number) {
        const element = document.getElementById('sparkline-tooltip')
        if (element) {
            element.innerText = text
            element.style.display = 'block'
        }
        valueOnHover.value = value
    }

    function hideTooltip() {
        const element = document.getElementById('sparkline-tooltip')
        if (element) element.style.display = 'none'
        valueOnHover.value = undefined
    }

    function moveTooltip(e: MouseEvent, value: number) {
        const element = document.getElementById('sparkline-tooltip')
        if (element) {
            element.style.left = `${e.clientX + 10}px`
            element.style.top = `${e.clientY + 10}px`
        }
        valueOnHover.value = value
    }

</script>

<template>
    <div id="sparkline-tooltip" style="
        position: fixed;
        background: black;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        display: none;
        pointer-events: none;
    "></div>  
    <v-card variant="text" height="400" class="mt-4" v-if="props.values?.length">
        <div ref="card" style="position: absolute; top: 0px; left: 10px; height: calc(100% - 30px); width: 100%;" class="d-flex flex-column justify-space-between">
            <div v-for="value of valuesY" class="d-flex align-center" style="width: 100%;">
                <span class="text-caption" style="width: 30px;">{{ value }}</span>
                <v-divider></v-divider>
            </div>
        </div>
        <div style="position: absolute; bottom: 0; left: 35px; width: 100%; height: 100%;" class="d-flex justify-space-between">
            <div v-for="value of labels" class="d-flex flex-column justify-center" style="width: 100%; height: 100%;">
                <v-divider vertical class="ml-4"></v-divider>
                <span class="text-caption" style="width: 40px;">{{ value }}</span>
            </div>
        </div>
        <div style="position: absolute; top: 0; left: 47px; width: 100%; height: calc(100% - 35px);" class="d-flex justify-space-between">
            <svg style="position: absolute; top:0;left:0; width: 100%; height: 100%;" ref="svg">
                <path 
                    v-for="i in props.values.length - 1"
                    :d="`M ${calculateCircleX(i)} ${calculateCricleYByIndexAndValue(i)} L ${calculateCircleX(i + 1)} ${calculateCricleYByIndexAndValue(i + 1)}`" 
                    stroke="#EF6C00" 
                    stroke-width="2" 
                    fill="none"
                />
                <circle 
                    v-for="(value, i) of props.values"
                    :key="i"
                    :cx="calculateCircleX(i + 1)"
                    :cy="calculateCricleYByIndexAndValue(i + 1)"
                    r="5"
                    fill="#EF6C00"
                ></circle>
            </svg>
        </div>
        <div style="position: absolute; bottom: 0; left: 35px; width: 100%; height: 100%;" class="d-flex justify-space-between">
            <div v-for="value of props.values" class="d-flex flex-column justify-center" style="width: 100%; height: 100%;">
                <v-card 
                    class="ml-4" variant="text" style="width: 100%; height: 100%;"
                    @mouseenter="showTooltip($event, `Acciones: ${value}`, value)"
                    @mouseleave="hideTooltip"
                    @mousemove="moveTooltip($event, value)"
                >
                    <v-card color="grey" style="opacity: 0.7;" :variant="valueOnHover === value ? 'elevated' : 'text'" height="100%" width="1"></v-card>
                </v-card>
                <span class="text-caption" style="width: 40px;">{{ value }}</span>
            </div>
        </div>
    </v-card>
</template>