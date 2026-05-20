<script setup lang="ts">
import type {ComponentPublicInstance} from 'vue'
import {useDraxAgent} from '../composables'
import VManagerBot from './vbots/VManagerBot.vue'

withDefaults(defineProps<{
  compact?: boolean
  showTitle?: boolean
}>(), {
  compact: false,
  showTitle: true,
})

const {
  agentSelectItems,
  agentsLoading,
  canSend,
  compactSpeechStatusLabel,
  error,
  getFeatureButtonClass,
  input,
  interimSpeech,
  loading,
  messages,
  messagesContainer,
  navigationButtonLabel,
  navigationEnabled,
  selectAgent,
  selectTextToSpeechProvider,
  selectedAgent,
  selectedAgentIdentifier,
  selectedTextToSpeechProvider,
  selectedTextToSpeechProviderLabel,
  sendMessage,
  sessionId,
  showAgentSelector,
  speechAutoSendEnabled,
  speechAutoSendLabel,
  speechButtonIcon,
  speechButtonLabel,
  speechEnabled,
  speechError,
  speechSupported,
  startNewSession,
  textToSpeechEnabled,
  textToSpeechProviderItems,
  textToSpeechProvidersLoading,
  textToSpeechSpeaking,
  textToSpeechSupported,
  toggleNavigation,
  toggleSpeechAutoSend,
  toggleSpeechRecognition,
  toggleTextToSpeech,
  toggleVisualBot,
  visualBotButtonLabel,
  visualBotVisible,
} = useDraxAgent()

function setMessagesContainer(element: Element | ComponentPublicInstance | null) {
  messagesContainer.value = element instanceof HTMLElement ? element : null
}
</script>

<template>
  <section
    class="chatbot-task"
    :class="{'chatbot-task--compact': compact}"
  >
    <template v-if="compact">
      <div
        class="chatbot-task__compact-control"
        :class="{
          'chatbot-task__compact-control--listening': speechEnabled,
          'chatbot-task__compact-control--loading': loading,
          'chatbot-task__compact-control--speaking': textToSpeechSpeaking,
          'chatbot-task__compact-control--error': Boolean(speechError),
        }"
      >
        <span
          v-if="loading"
          class="chatbot-task__compact-processing"
          aria-hidden="true"
        />
        <span
          v-if="textToSpeechSpeaking"
          class="chatbot-task__compact-speaking"
          aria-hidden="true"
        >
          <v-icon icon="mdi-volume-high" size="16" />
        </span>

        <v-btn
          v-if="speechSupported"
          color="primary"
          variant="tonal"
          size="large"
          :class="getFeatureButtonClass(speechEnabled)"
          :icon="speechButtonIcon"
          :aria-label="speechButtonLabel"
          :title="speechButtonLabel"
          @pointerdown.stop
          @click="toggleSpeechRecognition"
        />
        <v-btn
          v-else
          color="primary"
          variant="tonal"
          size="large"
          icon="mdi-microphone-off"
          disabled
          aria-label="Microfono no disponible"
          title="Microfono no disponible"
          @pointerdown.stop
        />
      </div>

      <span
        class="chatbot-task__compact-status"
        :class="{
          'chatbot-task__compact-status--active': speechEnabled,
          'chatbot-task__compact-status--loading': loading,
          'chatbot-task__compact-status--speaking': textToSpeechSpeaking,
          'chatbot-task__compact-status--error': Boolean(speechError),
        }"
      >
        {{ compactSpeechStatusLabel }}
      </span>
    </template>

    <template v-else>
      <header class="chatbot-task__header">
        <div v-if="showTitle || sessionId">
          <h1 v-if="showTitle">Asistente de tareas</h1>
          <p v-if="sessionId">Sesion {{ sessionId.slice(0, 8) }}</p>
        </div>

        <div class="chatbot-task__header-actions">
          <v-combobox
            v-if="showAgentSelector"
            :model-value="selectedAgentIdentifier"
            :items="agentSelectItems"
            item-title="title"
            item-value="value"
            label="Agente"
            density="compact"
            variant="outlined"
            hide-details
            :loading="agentsLoading"
            :disabled="loading || agentsLoading"
            :return-object="false"
            class="chatbot-task__agent-select"
            @update:model-value="selectAgent"
          >
            <template #selection>
              <span class="chatbot-task__agent-selection">{{ selectedAgent?.identifier ?? 'default' }}</span>
            </template>
          </v-combobox>

          <v-btn
            color="primary"
            variant="tonal"
            :class="getFeatureButtonClass(visualBotVisible)"
            :icon="visualBotVisible ? 'mdi-robot-off-outline' : 'mdi-robot-outline'"
            :aria-label="visualBotButtonLabel"
            :title="visualBotButtonLabel"
            @click="toggleVisualBot"
          />

          <v-btn
            color="primary"
            variant="tonal"
            :class="getFeatureButtonClass(navigationEnabled)"
            :icon="navigationEnabled ? 'mdi-map-marker-outline' : 'mdi-map-marker-off-outline'"
            :aria-label="navigationButtonLabel"
            :title="navigationButtonLabel"
            @click="toggleNavigation"
          />

          <v-btn
            v-if="speechSupported"
            color="primary"
            variant="tonal"
            :class="getFeatureButtonClass(speechAutoSendEnabled)"
            :icon="speechAutoSendEnabled ? 'mdi-send-check' : 'mdi-send-outline'"
            :aria-label="speechAutoSendLabel"
            :title="speechAutoSendLabel"
            @click="toggleSpeechAutoSend"
          />

          <template v-if="textToSpeechSupported">
            <v-btn
              color="primary"
              variant="tonal"
              :class="getFeatureButtonClass(textToSpeechEnabled)"
              :icon="textToSpeechEnabled ? 'mdi-volume-high' : 'mdi-volume-off'"
              :aria-label="textToSpeechEnabled ? 'Apagar lectura de respuestas' : 'Prender lectura de respuestas'"
              :title="textToSpeechEnabled ? 'Apagar lectura de respuestas' : 'Prender lectura de respuestas'"
              @click="toggleTextToSpeech"
            />

            <v-menu max-height="320" location="bottom end">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  color="primary"
                  variant="tonal"
                  icon="mdi-account-voice"
                  aria-label="Elegir proveedor de voz"
                  :title="`Elegir proveedor de voz: ${selectedTextToSpeechProviderLabel}`"
                  :loading="textToSpeechProvidersLoading"
                />
              </template>

              <v-list density="compact" class="chatbot-task__tts-provider-list">
                <v-list-subheader>Proveedor de voz</v-list-subheader>
                <v-list-item
                  v-for="provider in textToSpeechProviderItems"
                  :key="provider.value"
                  :active="provider.value === selectedTextToSpeechProvider"
                  :disabled="provider.props.disabled"
                  @click="selectTextToSpeechProvider(provider.value)"
                >
                  <template #prepend>
                    <v-icon
                      :icon="provider.value === selectedTextToSpeechProvider ? 'mdi-check' : 'mdi-account-voice'"
                      size="small"
                    />
                  </template>
                  <v-list-item-title>{{ provider.title }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </template>

          <v-btn
            color="primary"
            variant="tonal"
            prepend-icon="mdi-plus"
            :loading="loading"
            @click="startNewSession"
          >
            CHAT
          </v-btn>
        </div>
      </header>

      <v-alert
        v-if="error"
        type="error"
        variant="tonal"
        density="compact"
        closable
        class="chatbot-task__error-alert mb-3"
        @click:close="error = null"
      >
        {{ error }}
      </v-alert>

      <div
        class="chatbot-task__conversation"
        :class="{'chatbot-task__conversation--with-bot': visualBotVisible}"
      >
        <div :ref="setMessagesContainer" class="chatbot-task__messages">
          <div
            v-for="(message, index) in messages"
            :key="index"
            class="chatbot-task__message-row"
            :class="`chatbot-task__message-row--${message.role}`"
          >
            <div class="chatbot-task__message">
              {{ message.content }}
            </div>
          </div>

          <div v-if="loading" class="chatbot-task__message-row chatbot-task__message-row--assistant">
            <div class="chatbot-task__message chatbot-task__message--loading">
              Procesando...
            </div>
          </div>
        </div>

        <div
          v-if="visualBotVisible"
          class="chatbot-task__visual-bot"
        >
          <VManagerBot
            :visible="true"
            :speaking="textToSpeechSpeaking"
          />
        </div>
      </div>

      <form class="chatbot-task__composer" @submit.prevent="sendMessage">
        <v-textarea
          v-model="input"
          label="Mensaje"
          rows="2"
          auto-grow
          max-rows="5"
          hide-details
          :disabled="loading"
          variant="outlined"
          @keydown.enter.exact.prevent="sendMessage"
        />

        <v-btn
          v-if="speechSupported"
          color="primary"
          variant="tonal"
          :class="getFeatureButtonClass(speechEnabled)"
          :icon="speechButtonIcon"
          :aria-label="speechButtonLabel"
          :title="speechButtonLabel"
          @click="toggleSpeechRecognition"
        />

        <v-btn
          color="primary"
          icon="mdi-send"
          type="submit"
          :disabled="!canSend"
          :loading="loading"
          aria-label="Enviar"
        />
      </form>

      <p
        v-if="speechEnabled || speechError"
        class="chatbot-task__speech-status"
        :class="{'chatbot-task__speech-status--error': speechError}"
      >
        {{ speechError ?? (interimSpeech ? `Escuchando: ${interimSpeech}` : 'Microfono activo') }}
      </p>
    </template>
  </section>
</template>

<style scoped>
.chatbot-task {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 128px);
  min-height: 560px;
  padding: 24px;
  background: rgb(var(--v-theme-surface));
}

.chatbot-task--compact {
  align-items: center;
  justify-content: center;
  gap: 7px;
  width: 100%;
  height: 100%;
  min-height: 0;
  padding: 16px 10px 10px;
}

.chatbot-task__compact-control {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 58px;
  height: 58px;
}

.chatbot-task__compact-control::before {
  position: absolute;
  inset: 3px;
  content: '';
  border: 2px solid transparent;
  border-radius: 999px;
  opacity: 0;
  pointer-events: none;
}

.chatbot-task__compact-control--listening::before {
  border-color: rgba(var(--v-theme-primary), 0.32);
  opacity: 1;
}

.chatbot-task__compact-control--error::before {
  border-color: rgba(var(--v-theme-error), 0.58);
  opacity: 1;
}

.chatbot-task__compact-processing {
  position: absolute;
  inset: 0;
  z-index: 0;
  border: 3px solid rgba(var(--v-theme-primary), 0.18);
  border-top-color: rgb(var(--v-theme-primary));
  border-radius: 999px;
  animation: chatbot-task-compact-spin 0.85s linear infinite;
  pointer-events: none;
}

.chatbot-task__compact-speaking {
  position: absolute;
  right: -3px;
  bottom: -2px;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: rgb(var(--v-theme-on-primary));
  background: rgb(var(--v-theme-primary));
  border: 2px solid rgb(var(--v-theme-surface));
  border-radius: 999px;
  animation: chatbot-task-compact-speaking 1s ease-in-out infinite;
  pointer-events: none;
}

.chatbot-task__compact-control .v-btn {
  z-index: 1;
}

.chatbot-task__compact-status {
  max-width: 100%;
  overflow: hidden;
  color: rgba(var(--v-theme-on-surface), 0.68);
  font-size: 0.75rem;
  line-height: 1;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chatbot-task__compact-status--active {
  color: rgb(var(--v-theme-primary));
}

.chatbot-task__compact-status--loading,
.chatbot-task__compact-status--speaking {
  color: rgb(var(--v-theme-primary));
  font-weight: 600;
}

.chatbot-task__compact-status--error {
  color: rgb(var(--v-theme-error));
}

@keyframes chatbot-task-compact-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes chatbot-task-compact-speaking {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.78;
  }

  50% {
    transform: scale(1.12);
    opacity: 1;
  }
}

.chatbot-task__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.chatbot-task__header h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.chatbot-task__header p {
  margin: 4px 0 0;
  color: rgba(var(--v-theme-on-surface), 0.64);
  font-size: 0.875rem;
}

.chatbot-task__header-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.chatbot-task__agent-select {
  width: 190px;
  flex: 0 0 190px;
}

.chatbot-task__agent-selection {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chatbot-task__tts-provider-list {
  min-width: 280px;
  max-width: min(420px, calc(100vw - 32px));
}

.chatbot-task__feature-button--off {
  color: rgb(var(--v-theme-on-surface)) !important;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.2);
  background: rgba(var(--v-theme-on-surface), 0.08) !important;
}

.chatbot-task__error-alert {
  align-self: flex-start;
  max-width: 100%;
  width: fit-content;
}

.chatbot-task__conversation {
  position: relative;
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 16px;
}

.chatbot-task__conversation--with-bot {
  grid-template-columns: minmax(0, 1fr);
}

.chatbot-task__visual-bot {
  position: absolute;
  right: 14px;
  bottom: 14px;
  z-index: 3;
  display: grid;
  place-items: center;
}

.chatbot-task__visual-bot :deep(.visual-bot-manager) {
  --visual-bot-scale: 0.68;
}

.chatbot-task__messages {
  min-height: 0;
  overflow-y: auto;
  padding: 16px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
  background: rgba(var(--v-theme-on-surface), 0.025);
}

.chatbot-task__conversation--with-bot .chatbot-task__messages {
  padding-right: 124px;
  padding-bottom: 124px;
}

.chatbot-task__message-row {
  display: flex;
  margin-bottom: 12px;
}

.chatbot-task__message-row--user {
  justify-content: flex-end;
}

.chatbot-task__message-row--assistant {
  justify-content: flex-start;
}

.chatbot-task__message {
  max-width: min(720px, 82%);
  padding: 10px 12px;
  border-radius: 8px;
  white-space: pre-wrap;
  line-height: 1.45;
}

.chatbot-task__message-row--user .chatbot-task__message {
  color: rgb(var(--v-theme-on-primary));
  background: rgb(var(--v-theme-primary));
}

.chatbot-task__message-row--assistant .chatbot-task__message {
  color: rgb(var(--v-theme-on-surface));
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.chatbot-task__message--loading {
  color: rgba(var(--v-theme-on-surface), 0.68);
}

.chatbot-task__composer {
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  align-items: end;
  gap: 12px;
  margin-top: 16px;
}

.chatbot-task__speech-status {
  min-height: 20px;
  margin: 8px 0 0;
  color: rgba(var(--v-theme-on-surface), 0.68);
  font-size: 0.875rem;
}

.chatbot-task__speech-status--error {
  color: rgb(var(--v-theme-error));
}

@media (max-width: 700px) {
  .chatbot-task {
    height: calc(100vh - 88px);
    min-height: 480px;
    padding: 12px;
  }

  .chatbot-task__header {
    align-items: flex-start;
    flex-direction: column;
  }

  .chatbot-task__header-actions {
    width: 100%;
    flex-wrap: wrap;
    justify-content: flex-start;
  }

  .chatbot-task__agent-select {
    width: 100%;
    flex: 1 1 100%;
  }

  .chatbot-task__messages {
    padding: 12px;
  }

  .chatbot-task__conversation,
  .chatbot-task__conversation--with-bot {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: minmax(0, 1fr);
  }

  .chatbot-task__message {
    max-width: 92%;
  }

  .chatbot-task__composer {
    grid-template-columns: 1fr auto auto auto;
  }
}
</style>
