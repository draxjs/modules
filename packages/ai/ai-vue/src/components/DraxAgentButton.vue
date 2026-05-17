<script setup lang="ts">
import {computed, nextTick, onBeforeUnmount, onMounted, ref} from 'vue'
import DraxAgent from './DraxAgent.vue'

const PANEL_MARGIN = 16
const PANEL_INITIAL_TOP = 72
const PANEL_INITIAL_WIDTH = 860
const PANEL_INITIAL_HEIGHT = 620
const PANEL_MIN_WIDTH = 420
const PANEL_MIN_HEIGHT = 420

const chatbotTaskPanel = ref(false)
const panelFullscreen = ref(false)
const panelPosition = ref({x: PANEL_MARGIN, y: PANEL_INITIAL_TOP})
const panelSize = ref({width: PANEL_INITIAL_WIDTH, height: PANEL_INITIAL_HEIGHT})
const panelPositionInitialized = ref(false)
const dragState = ref<{
  pointerId: number
  startX: number
  startY: number
  originX: number
  originY: number
} | null>(null)
const resizeState = ref<{
  pointerId: number
  startX: number
  startY: number
  originWidth: number
  originHeight: number
} | null>(null)

const panelStyle = computed(() => panelFullscreen.value
  ? {
    left: '0',
    top: '0',
    width: '100vw',
    height: '100vh',
  }
  : {
    left: `${panelPosition.value.x}px`,
    top: `${panelPosition.value.y}px`,
    width: `${panelSize.value.width}px`,
    height: `${panelSize.value.height}px`,
  })
const panelFullscreenButtonLabel = computed(() => panelFullscreen.value
  ? 'Volver a ventana compacta'
  : 'Maximizar asistente')

async function openAgentPanel() {
  chatbotTaskPanel.value = true

  await nextTick()

  if (!panelPositionInitialized.value) {
    positionPanelAtStart()
    panelPositionInitialized.value = true
    return
  }

  panelSize.value = clampPanelSize(panelSize.value.width, panelSize.value.height)
  panelPosition.value = clampPanelPosition(panelPosition.value.x, panelPosition.value.y)
}

function closeAgentPanel() {
  chatbotTaskPanel.value = false
  panelFullscreen.value = false
}

function togglePanelFullscreen() {
  panelFullscreen.value = !panelFullscreen.value
  stopPanelDrag()
  stopPanelResize()
}

function positionPanelAtStart() {
  if (typeof window === 'undefined') {
    return
  }

  panelSize.value = clampPanelSize(panelSize.value.width, panelSize.value.height)
  panelPosition.value = clampPanelPosition(
    window.innerWidth - panelSize.value.width - PANEL_MARGIN,
    PANEL_INITIAL_TOP,
  )
}

function startPanelDrag(event: PointerEvent) {
  if (panelFullscreen.value) {
    return
  }

  if (event.button !== 0) {
    return
  }

  event.preventDefault()
  dragState.value = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    originX: panelPosition.value.x,
    originY: panelPosition.value.y,
  }

  window.addEventListener('pointermove', movePanel)
  window.addEventListener('pointerup', stopPanelDrag)
  window.addEventListener('pointercancel', stopPanelDrag)
}

function movePanel(event: PointerEvent) {
  if (!dragState.value || event.pointerId !== dragState.value.pointerId) {
    return
  }

  event.preventDefault()
  panelPosition.value = clampPanelPosition(
    dragState.value.originX + event.clientX - dragState.value.startX,
    dragState.value.originY + event.clientY - dragState.value.startY,
  )
}

function stopPanelDrag() {
  dragState.value = null

  if (typeof window === 'undefined') {
    return
  }

  window.removeEventListener('pointermove', movePanel)
  window.removeEventListener('pointerup', stopPanelDrag)
  window.removeEventListener('pointercancel', stopPanelDrag)
}

function startPanelResize(event: PointerEvent) {
  if (panelFullscreen.value) {
    return
  }

  if (event.button !== 0) {
    return
  }

  event.preventDefault()
  resizeState.value = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    originWidth: panelSize.value.width,
    originHeight: panelSize.value.height,
  }

  window.addEventListener('pointermove', resizePanel)
  window.addEventListener('pointerup', stopPanelResize)
  window.addEventListener('pointercancel', stopPanelResize)
}

function resizePanel(event: PointerEvent) {
  if (!resizeState.value || event.pointerId !== resizeState.value.pointerId) {
    return
  }

  event.preventDefault()

  panelSize.value = clampPanelSize(
    resizeState.value.originWidth + event.clientX - resizeState.value.startX,
    resizeState.value.originHeight + event.clientY - resizeState.value.startY,
  )
  panelPosition.value = clampPanelPosition(panelPosition.value.x, panelPosition.value.y)
}

function stopPanelResize() {
  resizeState.value = null

  if (typeof window === 'undefined') {
    return
  }

  window.removeEventListener('pointermove', resizePanel)
  window.removeEventListener('pointerup', stopPanelResize)
  window.removeEventListener('pointercancel', stopPanelResize)
}

function keepPanelInViewport() {
  if (!chatbotTaskPanel.value) {
    return
  }

  if (panelFullscreen.value) {
    return
  }

  panelSize.value = clampPanelSize(panelSize.value.width, panelSize.value.height)
  panelPosition.value = clampPanelPosition(panelPosition.value.x, panelPosition.value.y)
}

function clampPanelPosition(x: number, y: number) {
  if (typeof window === 'undefined') {
    return {x, y}
  }

  const maxX = Math.max(PANEL_MARGIN, window.innerWidth - panelSize.value.width - PANEL_MARGIN)
  const maxY = Math.max(PANEL_MARGIN, window.innerHeight - panelSize.value.height - PANEL_MARGIN)

  return {
    x: Math.min(Math.max(PANEL_MARGIN, x), maxX),
    y: Math.min(Math.max(PANEL_MARGIN, y), maxY),
  }
}

function clampPanelSize(width: number, height: number) {
  if (typeof window === 'undefined') {
    return {width, height}
  }

  const availableWidth = window.innerWidth - PANEL_MARGIN * 2
  const availableHeight = window.innerHeight - PANEL_MARGIN * 2
  const minWidth = Math.min(PANEL_MIN_WIDTH, availableWidth)
  const minHeight = Math.min(PANEL_MIN_HEIGHT, availableHeight)

  return {
    width: Math.min(Math.max(minWidth, width), availableWidth),
    height: Math.min(Math.max(minHeight, height), availableHeight),
  }
}

onMounted(() => {
  window.addEventListener('resize', keepPanelInViewport)
})

onBeforeUnmount(() => {
  stopPanelDrag()
  stopPanelResize()
  window.removeEventListener('resize', keepPanelInViewport)
})
</script>

<template>
  <v-btn
    icon
    class="mr-2"
    aria-label="Asistente de tareas"
    @click="openAgentPanel"
  >
    <v-icon>mdi-robot-outline</v-icon>
    <v-tooltip activator="parent" location="bottom">
      Asistente de tareas
    </v-tooltip>
  </v-btn>

  <v-card
    v-if="chatbotTaskPanel"
    class="drax-agent-button__panel"
    :class="{'drax-agent-button__panel--fullscreen': panelFullscreen}"
    :style="panelStyle"
    elevation="12"
  >
    <v-toolbar
      class="drax-agent-button__panel-toolbar"
      density="comfortable"
      @pointerdown="startPanelDrag"
    >
      <v-icon class="drax-agent-button__drag-icon" icon="mdi-drag" />
      <v-toolbar-title>Asistente de tareas</v-toolbar-title>
      <v-spacer />
      <v-btn
        icon
        :aria-label="panelFullscreenButtonLabel"
        :title="panelFullscreenButtonLabel"
        @pointerdown.stop
        @click="togglePanelFullscreen"
      >
        <v-icon>{{ panelFullscreen ? 'mdi-window-restore' : 'mdi-fullscreen' }}</v-icon>
      </v-btn>
      <v-btn
        icon
        aria-label="Cerrar asistente de tareas"
        @pointerdown.stop
        @click="closeAgentPanel"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-toolbar>

    <v-card-text class="drax-agent-button__panel-content">
      <DraxAgent :show-title="false" />
    </v-card-text>

    <button
      v-if="!panelFullscreen"
      class="drax-agent-button__resize-handle"
      type="button"
      aria-label="Redimensionar asistente de tareas"
      @pointerdown.stop="startPanelResize"
    >
      <v-icon icon="mdi-resize-bottom-right" size="18" />
    </button>
  </v-card>
</template>

<style scoped>
.drax-agent-button__panel {
  position: fixed;
  z-index: 2400;
  display: flex;
  flex-direction: column;
  container-type: inline-size;
  min-width: min(420px, calc(100vw - 32px));
  min-height: min(420px, calc(100vh - 32px));
  max-width: calc(100vw - 32px);
  max-height: calc(100vh - 32px);
  overflow: hidden;
}

.drax-agent-button__panel--fullscreen {
  border-radius: 0;
  max-width: 100vw;
  max-height: 100vh;
}

.drax-agent-button__panel-toolbar {
  cursor: move;
  user-select: none;
  touch-action: none;
}

.drax-agent-button__panel--fullscreen .drax-agent-button__panel-toolbar {
  cursor: default;
}

.drax-agent-button__drag-icon {
  margin-left: 12px;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.drax-agent-button__panel-content {
  flex: 1;
  min-height: 0;
  padding: 0;
  overflow: hidden;
}

.drax-agent-button__panel-content :deep(.chatbot-task) {
  height: 100%;
  min-height: 0;
}

.drax-agent-button__resize-handle {
  position: absolute;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  width: 32px;
  height: 32px;
  padding: 0 3px 3px 0;
  color: rgba(var(--v-theme-on-surface), 0.5);
  cursor: nwse-resize;
  touch-action: none;
  background: transparent;
  border: 0;
}

.drax-agent-button__resize-handle:hover {
  color: rgba(var(--v-theme-on-surface), 0.82);
}

@container (max-width: 700px) {
  .drax-agent-button__panel-content :deep(.chatbot-task) {
    padding: 12px;
  }

  .drax-agent-button__panel-content :deep(.chatbot-task__header) {
    align-items: flex-start;
    flex-direction: column;
  }

  .drax-agent-button__panel-content :deep(.chatbot-task__header-actions) {
    width: 100%;
    flex-wrap: wrap;
    justify-content: flex-start;
  }

  .drax-agent-button__panel-content :deep(.chatbot-task__conversation),
  .drax-agent-button__panel-content :deep(.chatbot-task__conversation--with-bot) {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: minmax(0, 1fr);
  }

  .drax-agent-button__panel-content :deep(.chatbot-task__messages) {
    padding: 12px;
  }

  .drax-agent-button__panel-content :deep(.chatbot-task__conversation--with-bot .chatbot-task__messages) {
    padding-right: 92px;
    padding-bottom: 92px;
  }

  .drax-agent-button__panel-content :deep(.chatbot-task__message) {
    max-width: 92%;
  }

  .drax-agent-button__panel-content :deep(.chatbot-task__composer) {
    grid-template-columns: 1fr auto auto auto;
  }
}
</style>
