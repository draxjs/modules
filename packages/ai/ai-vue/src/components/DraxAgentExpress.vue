<script setup lang="ts">
import {computed, onBeforeUnmount, ref} from 'vue'
import {useDraxAgent} from '../composables'
import VManagerBot from './vbots/VManagerBot.vue'

withDefaults(defineProps<{
  allowNavigationToggle?: boolean
}>(), {
  allowNavigationToggle: false,
})

const {
  agentSelectItems,
  agentsLoading,
  assistantSpeechPendingText,
  assistantSpeechSpokenText,
  currentAssistantMessage,
  error,
  input,
  interimSpeech,
  loading,
  navigationButtonLabel,
  navigationEnabled,
  selectAgent,
  selectedAgent,
  selectedAgentIdentifier,
  showAgentSelector,
  speechError,
  speechPressToTalkActive,
  speechSupported,
  startPressToTalk,
  stopTextToSpeech,
  stopPressToTalk,
  textToSpeechEnabled,
  textToSpeechSpeaking,
  textToSpeechSupported,
  toggleNavigation,
  toggleTextToSpeech,
} = useDraxAgent()

const activePointerId = ref<number | null>(null)

const statusLabel = computed(() => {
  if (speechError.value) {
    return speechError.value
  }

  if (error.value) {
    return error.value
  }

  if (loading.value) {
    return 'Procesando...'
  }

  if (textToSpeechSpeaking.value) {
    return 'Respondiendo'
  }

  if (speechPressToTalkActive.value) {
    return interimSpeech.value || input.value || 'Escuchando'
  }

  return speechSupported.value ? 'Hablar' : 'Microfono no disponible'
})

const textModeButtonLabel = computed(() => textToSpeechEnabled.value
  ? 'Activar modo solo texto'
  : 'Activar voz del agente')
const selectedAgentLabel = computed(() => selectedAgent.value?.identifier ?? selectedAgentIdentifier.value ?? 'default')

function startHoldToTalk(event: PointerEvent) {
  if (event.button !== 0 || !speechSupported.value || loading.value || textToSpeechSpeaking.value) {
    return
  }

  activePointerId.value = event.pointerId
  const target = event.currentTarget as HTMLElement | null
  target?.setPointerCapture?.(event.pointerId)
  startPressToTalk()
}

function stopHoldToTalk(event?: Event) {
  const pointerEvent = typeof PointerEvent !== 'undefined' && event instanceof PointerEvent ? event : null

  if (pointerEvent && activePointerId.value !== null && pointerEvent.pointerId !== activePointerId.value) {
    return
  }

  activePointerId.value = null
  stopPressToTalk()
}

function startKeyboardTalk(event: KeyboardEvent) {
  if (event.repeat || (event.key !== ' ' && event.key !== 'Enter')) {
    return
  }

  event.preventDefault()
  startPressToTalk()
}

function stopKeyboardTalk(event: KeyboardEvent) {
  if (event.key !== ' ' && event.key !== 'Enter') {
    return
  }

  event.preventDefault()
  stopPressToTalk()
}

onBeforeUnmount(() => {
  stopPressToTalk()
})
</script>

<template>
  <section
    class="drax-agent-express"
    :class="{
      'drax-agent-express--listening': speechPressToTalkActive,
      'drax-agent-express--speaking': textToSpeechSpeaking,
      'drax-agent-express--loading': loading,
    }"
  >
    <div class="drax-agent-express__corner-actions">
      <span
        v-if="showAgentSelector"
        class="drax-agent-express__agent-label"
        :title="`Agente: ${selectedAgentLabel}`"
      >
        {{ selectedAgentLabel }}
      </span>

      <v-menu
        v-if="showAgentSelector"
        location="bottom end"
        max-height="320"
      >
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            color="primary"
            variant="tonal"
            size="small"
            icon="mdi-account-cog-outline"
            :loading="agentsLoading"
            :disabled="loading || agentsLoading"
            :aria-label="`Elegir agente. Actual: ${selectedAgentLabel}`"
            :title="`Agente: ${selectedAgentLabel}`"
          />
        </template>

        <v-list
          class="drax-agent-express__agent-list"
          density="compact"
          lines="two"
        >
          <v-list-subheader>Agente</v-list-subheader>
          <v-list-item
            v-for="agent in agentSelectItems"
            :key="agent.value"
            :active="agent.value === selectedAgentIdentifier"
            @click="selectAgent(agent.value)"
          >
            <template #prepend>
              <v-icon
                :icon="agent.value === selectedAgentIdentifier ? 'mdi-check' : 'mdi-account-outline'"
                size="small"
              />
            </template>
            <v-list-item-title>{{ agent.title }}</v-list-item-title>
            <v-list-item-subtitle>{{ agent.value }}</v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-menu>

      <template v-if="textToSpeechSupported">
        <v-btn
          color="primary"
          variant="tonal"
          size="small"
          :icon="textToSpeechEnabled ? 'mdi-volume-high' : 'mdi-volume-off'"
          :aria-label="textModeButtonLabel"
          :title="textModeButtonLabel"
          @click="toggleTextToSpeech"
        />
      </template>

      <v-btn
        v-if="allowNavigationToggle"
        color="primary"
        variant="tonal"
        size="small"
        :icon="navigationEnabled ? 'mdi-map-marker-outline' : 'mdi-map-marker-off-outline'"
        :aria-label="navigationButtonLabel"
        :title="navigationButtonLabel"
        @click="toggleNavigation"
      />
    </div>

    <div class="drax-agent-express__bot-panel">
      <VManagerBot
        :visible="true"
        :speaking="textToSpeechSpeaking"
      />

      <p
        class="drax-agent-express__message"
        :class="{'drax-agent-express__message--speaking': textToSpeechSpeaking}"
      >
        <template v-if="textToSpeechSpeaking">
          <span class="drax-agent-express__message-spoken">{{ assistantSpeechSpokenText }}</span><span>{{ assistantSpeechPendingText }}</span>
        </template>
        <template v-else>
          {{ currentAssistantMessage }}
        </template>
      </p>

      <v-btn
        v-if="textToSpeechSpeaking"
        class="drax-agent-express__silence-button"
        color="primary"
        variant="text"
        size="small"
        prepend-icon="mdi-volume-off"
        @click="stopTextToSpeech"
      >
        Silenciar
      </v-btn>
    </div>

    <div class="drax-agent-express__talk-panel">
      <button
        class="drax-agent-express__mic-button"
        type="button"
        :disabled="!speechSupported || loading || textToSpeechSpeaking"
        :aria-pressed="speechPressToTalkActive"
        :aria-label="statusLabel"
        @pointerdown.prevent="startHoldToTalk"
        @pointerup.prevent="stopHoldToTalk"
        @pointercancel.prevent="stopHoldToTalk"
        @lostpointercapture="stopHoldToTalk"
        @keydown="startKeyboardTalk"
        @keyup="stopKeyboardTalk"
      >
        <span class="drax-agent-express__mic-ring" aria-hidden="true" />
        <v-icon
          class="drax-agent-express__mic-icon"
          :icon="speechPressToTalkActive ? 'mdi-microphone' : 'mdi-microphone-outline'"
          size="76"
        />
      </button>

      <p
        class="drax-agent-express__status"
        :class="{'drax-agent-express__status--error': speechError || error}"
      >
        {{ statusLabel }}
      </p>
    </div>
  </section>
</template>

<style scoped>
.drax-agent-express {
  position: relative;
  display: grid;
  grid-template-rows: minmax(0, 3fr) minmax(0, 2fr);
  width: 100%;
  height: calc(100vh - 128px);
  min-height: 540px;
  overflow: hidden;
  background: rgb(var(--v-theme-surface));
}

.drax-agent-express__corner-actions {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 8px;
}

.drax-agent-express__agent-label {
  max-width: min(220px, calc(100vw - 136px));
  overflow: hidden;
  padding: 3px 8px;
  color: rgba(var(--v-theme-on-surface), 0.7);
  background: rgba(var(--v-theme-surface), 0.74);
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 600;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
  backdrop-filter: blur(6px);
}

.drax-agent-express__agent-list {
  min-width: 240px;
  max-width: min(360px, calc(100vw - 32px));
}

.drax-agent-express__bot-panel,
.drax-agent-express__talk-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
  padding: 28px;
}

.drax-agent-express__bot-panel {
  flex-direction: column;
  gap: 24px;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  background: rgba(var(--v-theme-on-surface), 0.025);
}

.drax-agent-express__bot-panel :deep(.visual-bot-manager) {
  --visual-bot-scale: 1.28;
}

.drax-agent-express__message {
  width: min(760px, 100%);
  min-height: 74px;
  margin: 0;
  color: rgba(var(--v-theme-on-surface), 0.78);
  font-size: clamp(1.25rem, 2.4vw, 2rem);
  font-weight: 600;
  line-height: 1.32;
  text-align: center;
  text-wrap: balance;
}

.drax-agent-express__message--speaking {
  color: rgba(var(--v-theme-on-surface), 0.66);
}

.drax-agent-express__message-spoken {
  color: rgb(var(--v-theme-primary));
  transition: color 120ms ease;
}

.drax-agent-express__silence-button {
  min-height: 28px;
  opacity: 0.72;
}

.drax-agent-express__silence-button:hover {
  opacity: 1;
}

.drax-agent-express__talk-panel {
  position: relative;
  flex-direction: column;
  gap: 16px;
  justify-content: flex-end;
}

.drax-agent-express__mic-button {
  position: relative;
  display: inline-grid;
  place-items: center;
  align-self: stretch;
  flex: 1 1 auto;
  width: 100%;
  min-height: 156px;
  color: rgb(var(--v-theme-on-primary));
  background: rgb(var(--v-theme-primary));
  border: 0;
  border-radius: 18px;
  box-shadow: 0 22px 48px rgba(var(--v-theme-primary), 0.34);
  cursor: pointer;
  transition: transform 160ms ease, box-shadow 160ms ease, opacity 160ms ease;
  touch-action: none;
  user-select: none;
}

.drax-agent-express__mic-button:disabled {
  cursor: default;
  opacity: 0.52;
}

.drax-agent-express__mic-button:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 26px 54px rgba(var(--v-theme-primary), 0.4);
}

.drax-agent-express__mic-button:focus-visible {
  outline: 4px solid rgba(var(--v-theme-primary), 0.28);
  outline-offset: 6px;
}

.drax-agent-express__mic-button[aria-pressed="true"] {
  transform: scale(0.985);
}

.drax-agent-express__mic-ring {
  position: absolute;
  inset: -10px;
  border: 3px solid rgba(var(--v-theme-primary), 0.22);
  border-radius: inherit;
  opacity: 0;
  transform: scale(0.9);
  pointer-events: none;
}

.drax-agent-express--listening .drax-agent-express__mic-ring {
  animation: drax-agent-express-listening 1.1s ease-out infinite;
  opacity: 1;
}

.drax-agent-express__mic-icon {
  position: relative;
  z-index: 1;
}

.drax-agent-express__status {
  max-width: min(620px, 100%);
  min-height: 28px;
  margin: 0;
  overflow: hidden;
  color: rgba(var(--v-theme-on-surface), 0.68);
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.4;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.drax-agent-express__status--error {
  color: rgb(var(--v-theme-error));
}

@keyframes drax-agent-express-listening {
  0% {
    opacity: 0.64;
    transform: scale(0.88);
  }

  100% {
    opacity: 0;
    transform: scale(1.18);
  }
}

@media (max-width: 700px) {
  .drax-agent-express {
    height: calc(100vh - 88px);
    min-height: 480px;
  }

  .drax-agent-express__corner-actions {
    top: 10px;
    right: 10px;
    gap: 6px;
  }

  .drax-agent-express__agent-label {
    max-width: calc(100vw - 116px);
    padding: 2px 7px;
    font-size: 0.68rem;
  }

  .drax-agent-express__bot-panel,
  .drax-agent-express__talk-panel {
    padding: 18px;
  }

  .drax-agent-express__talk-panel {
    gap: 14px;
  }

  .drax-agent-express__bot-panel {
    gap: 18px;
  }

  .drax-agent-express__bot-panel :deep(.visual-bot-manager) {
    --visual-bot-scale: 0.92;
  }

  .drax-agent-express__message {
    min-height: 86px;
    font-size: 1.18rem;
  }

  .drax-agent-express__mic-button {
    min-height: 118px;
    border-radius: 16px;
  }
}
</style>
