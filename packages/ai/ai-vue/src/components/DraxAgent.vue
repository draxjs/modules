<script setup lang="ts">
import {computed, nextTick, onBeforeUnmount, onMounted, ref} from 'vue'
import {useRouter} from 'vue-router'
import {AgentProvider} from '@drax/ai-front'
import type {IAgentOption} from '@drax/ai-front'
import VisualBot from './VisualBot.vue'

withDefaults(defineProps<{
  showTitle?: boolean
}>(), {
  showTitle: true,
})

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface BrowserSpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  onend: (() => void) | null
  onerror: ((event: BrowserSpeechRecognitionErrorEvent) => void) | null
  onresult: ((event: BrowserSpeechRecognitionEvent) => void) | null
  onstart: (() => void) | null
  abort: () => void
  start: () => void
  stop: () => void
}

interface BrowserSpeechRecognitionConstructor {
  new(): BrowserSpeechRecognition
}

interface BrowserSpeechRecognitionErrorEvent extends Event {
  error: string
}

interface BrowserSpeechRecognitionEvent extends Event {
  resultIndex: number
  results: BrowserSpeechRecognitionResultList
}

interface BrowserSpeechRecognitionResultList {
  length: number
  [index: number]: BrowserSpeechRecognitionResult
}

interface BrowserSpeechRecognitionResult {
  isFinal: boolean
  [index: number]: BrowserSpeechRecognitionAlternative | undefined
}

interface BrowserSpeechRecognitionAlternative {
  transcript: string
}

const sessionId = ref<string>()
const router = useRouter()
const agents = ref<IAgentOption[]>([
  {
    identifier: 'default',
    description: '',
  },
])
const selectedAgentIdentifier = ref('default')
const agentsLoading = ref(false)
const messages = ref<ChatMessage[]>([
  {
    role: 'assistant',
    content: 'Hola. Decime que tarea queres registrar y la guardo por vos.',
  },
])
const input = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const messagesContainer = ref<HTMLElement | null>(null)
const speechRecognition = ref<BrowserSpeechRecognition | null>(null)
const speechSupported = ref(false)
const speechEnabled = ref(false)
const speechListening = ref(false)
const speechError = ref<string | null>(null)
const interimSpeech = ref('')
const speechAutoSendEnabled = ref(true)
const speechAutoSending = ref(false)
const speechAutoSendPending = ref(false)
const speechRestartTimer = ref<number | null>(null)
const speechRestartAttempts = ref(0)
const speechErrorDuringCurrentRun = ref(false)
const textToSpeechSupported = ref(false)
const textToSpeechEnabled = ref(true)
const textToSpeechSpeaking = ref(false)
const textToSpeechVoices = ref<SpeechSynthesisVoice[]>([])
const currentTextToSpeechId = ref(0)
const selectedVoiceURI = ref<string | null>(null)
const visualBotVisible = ref(true)
const navigationEnabled = ref(true)

const canSend = computed(() => input.value.trim().length > 0 && !loading.value)
const speechButtonIcon = computed(() => speechEnabled.value ? 'mdi-microphone-off' : 'mdi-microphone')
const speechButtonLabel = computed(() => speechEnabled.value ? 'Apagar microfono' : 'Prender microfono')
const speechAutoSendLabel = computed(() => speechAutoSendEnabled.value
  ? 'Apagar envio automatico al terminar de hablar'
  : 'Prender envio automatico al terminar de hablar')
const selectedVoice = computed(() => {
  if (!selectedVoiceURI.value) {
    return null
  }

  return textToSpeechVoices.value.find((voice) => voice.voiceURI === selectedVoiceURI.value) ?? null
})
const selectedVoiceName = computed(() => selectedVoice.value?.name ?? 'Voz predeterminada')
const visualBotButtonLabel = computed(() => visualBotVisible.value ? 'Ocultar bot visual' : 'Mostrar bot visual')
const navigationButtonLabel = computed(() => navigationEnabled.value
  ? 'Apagar navegacion automatica'
  : 'Prender navegacion automatica')
const selectedAgent = computed(() => agents.value.find((agent) => agent.identifier === selectedAgentIdentifier.value) ?? agents.value[0])
const showAgentSelector = computed(() => agents.value.length > 1)
const agentSelectItems = computed(() => agents.value.map((agent) => ({
  title: agent.description ? `${agent.identifier} - ${agent.description}` : agent.identifier,
  value: agent.identifier,
})))
const maxSpeechRestartAttempts = 3

async function loadAgents() {
  agentsLoading.value = true

  try {
    const response = await AgentProvider.instance.listAgents()
    agents.value = response.agents.length > 0
      ? response.agents
      : [{identifier: 'default', description: ''}]

    if (!agents.value.some((agent) => agent.identifier === selectedAgentIdentifier.value)) {
      selectedAgentIdentifier.value = agents.value[0]?.identifier ?? 'default'
    }
  } catch {
    agents.value = [{identifier: 'default', description: ''}]
    selectedAgentIdentifier.value = 'default'
  } finally {
    agentsLoading.value = false
  }
}

function selectAgent(value: unknown) {
  const identifier = typeof value === 'string' ? value : null

  if (!identifier || identifier === selectedAgentIdentifier.value) {
    return
  }

  if (!agents.value.some((agent) => agent.identifier === identifier)) {
    selectedAgentIdentifier.value = selectedAgent.value?.identifier ?? 'default'
    return
  }

  selectedAgentIdentifier.value = identifier
  sessionId.value = undefined
  messages.value = [
    {
      role: 'assistant',
      content: 'Hola. Decime que tarea queres registrar y la guardo por vos.',
    },
  ]
}

async function startNewSession() {
  loading.value = true
  error.value = null

  try {
    const response = await AgentProvider.instance.startSession(selectedAgentIdentifier.value)
    sessionId.value = response.sessionId
    messages.value = [
      {
        role: 'assistant',
        content: 'Nueva sesion iniciada. Que tarea queres registrar?',
      },
    ]
    speakAssistantMessage('Nueva sesion iniciada. Que tarea queres registrar?')
  } catch (e: any) {
    error.value = e?.message ?? 'No se pudo iniciar una nueva sesion.'
  } finally {
    loading.value = false
    await scrollToBottom()
  }
}

async function sendMessage() {
  if (!canSend.value) {
    return
  }

  const message = input.value.trim()
  input.value = ''
  error.value = null
  loading.value = true
  messages.value.push({role: 'user', content: message})
  await scrollToBottom()

  try {
    const response = await AgentProvider.instance.sendMessage(message, sessionId.value, selectedAgentIdentifier.value)
    sessionId.value = response.sessionId
    messages.value.push({role: 'assistant', content: response.message})
    await navigateAgentResponse(response.navigationPath)
    speakAssistantMessage(response.message)
  } catch (e: any) {
    error.value = e?.message ?? 'No se pudo enviar el mensaje.'
    const fallbackMessage = 'No pude procesar el pedido. Proba de nuevo en unos segundos.'
    messages.value.push({
      role: 'assistant',
      content: fallbackMessage,
    })
    speakAssistantMessage(fallbackMessage)
  } finally {
    loading.value = false
    await scrollToBottom()
    await sendPendingSpeechMessage()
  }
}

async function scrollToBottom() {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

async function navigateAgentResponse(navigationPath?: string | null) {
  if (!navigationPath || !navigationEnabled.value) {
    return
  }

  await router.push(navigationPath)
}

function getFeatureButtonClass(isEnabled: boolean) {
  return {
    'chatbot-task__feature-button': true,
    'chatbot-task__feature-button--off': !isEnabled,
  }
}

function setupSpeechRecognition() {
  if (typeof window === 'undefined') {
    return
  }

  const recognitionConstructor = (
    window as Window & {
      SpeechRecognition?: BrowserSpeechRecognitionConstructor
      webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor
    }
  ).SpeechRecognition ?? (
    window as Window & {
      webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor
    }
  ).webkitSpeechRecognition

  if (!recognitionConstructor) {
    return
  }

  const recognition = new recognitionConstructor()
  recognition.lang = 'es-AR'
  recognition.continuous = true
  recognition.interimResults = true
  recognition.onstart = () => {
    speechListening.value = true
    speechErrorDuringCurrentRun.value = false
    speechError.value = null
  }
  recognition.onend = () => {
    speechListening.value = false
    interimSpeech.value = ''
    if (speechErrorDuringCurrentRun.value) {
      return
    }
    startSpeechRecognitionIfEnabled()
  }
  recognition.onerror = (event) => {
    speechListening.value = false
    interimSpeech.value = ''
    speechErrorDuringCurrentRun.value = true
    speechError.value = getSpeechErrorMessage(event.error)
    if (isFatalSpeechRecognitionError(event.error)) {
      speechEnabled.value = false
      clearSpeechRestartTimer()
      resetSpeechRestartAttempts()
      return
    }
    startSpeechRecognitionIfEnabled(event.error)
  }
  recognition.onresult = (event) => {
    let finalTranscript = ''
    let nextInterimSpeech = ''

    for (let index = event.resultIndex; index < event.results.length; index += 1) {
      const result = event.results[index]
      if (!result) {
        continue
      }

      const transcript = result[0]?.transcript ?? ''

      if (result.isFinal) {
        finalTranscript += transcript
      } else {
        nextInterimSpeech += transcript
      }
    }

    if (finalTranscript.trim().length > 0) {
      resetSpeechRestartAttempts()
      speechError.value = null
      appendSpeechText(finalTranscript)
      sendSpeechMessageAutomatically()
    }

    interimSpeech.value = nextInterimSpeech.trim()
  }

  speechRecognition.value = recognition
  speechSupported.value = true
}

function setupTextToSpeech() {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    return
  }

  textToSpeechSupported.value = true
  loadTextToSpeechVoices()
  window.speechSynthesis.onvoiceschanged = loadTextToSpeechVoices
}

function loadTextToSpeechVoices() {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    return
  }

  const voices = window.speechSynthesis.getVoices()
    .sort((firstVoice, secondVoice) => {
      const firstVoiceIsSpanish = firstVoice.lang.toLowerCase().startsWith('es') ? 0 : 1
      const secondVoiceIsSpanish = secondVoice.lang.toLowerCase().startsWith('es') ? 0 : 1

      if (firstVoiceIsSpanish !== secondVoiceIsSpanish) {
        return firstVoiceIsSpanish - secondVoiceIsSpanish
      }

      return firstVoice.name.localeCompare(secondVoice.name)
    })

  textToSpeechVoices.value = voices

  if (!selectedVoiceURI.value && voices.length > 0) {
    selectedVoiceURI.value = voices.find((voice) => voice.lang.toLowerCase().startsWith('es'))?.voiceURI
      ?? voices[0]?.voiceURI
      ?? null
  }
}

function toggleSpeechRecognition() {
  if (!speechRecognition.value) {
    return
  }

  speechError.value = null

  if (speechEnabled.value) {
    speechEnabled.value = false
    clearSpeechRestartTimer()
    resetSpeechRestartAttempts()
    if (speechListening.value) {
      speechRecognition.value.stop()
    }
    return
  }

  speechEnabled.value = true
  resetSpeechRestartAttempts()
  startSpeechRecognition()
}

function startSpeechRecognition() {
  if (!speechRecognition.value || speechListening.value) {
    return
  }

  try {
    speechRecognition.value.start()
  } catch (e: any) {
    speechError.value = e?.message ?? 'No se pudo iniciar el dictado.'
    speechEnabled.value = false
    resetSpeechRestartAttempts()
  }
}

function startSpeechRecognitionIfEnabled(lastError?: string) {
  if (
    !speechEnabled.value
    || !speechRecognition.value
    || speechListening.value
    || isFatalSpeechRecognitionError(lastError)
  ) {
    return
  }

  if (lastError && shouldLimitSpeechRestart(lastError)) {
    speechRestartAttempts.value += 1
    if (speechRestartAttempts.value > maxSpeechRestartAttempts) {
      speechEnabled.value = false
      clearSpeechRestartTimer()
      speechError.value = 'Se pauso el microfono despues de varios errores seguidos. Volve a prenderlo para intentar de nuevo.'
      resetSpeechRestartAttempts()
      return
    }
  }

  clearSpeechRestartTimer()
  speechRestartTimer.value = window.setTimeout(() => {
    speechRestartTimer.value = null
    startSpeechRecognition()
  }, lastError ? Math.max(600, 600 * speechRestartAttempts.value) : 300)
}

function clearSpeechRestartTimer() {
  if (speechRestartTimer.value === null) {
    return
  }

  window.clearTimeout(speechRestartTimer.value)
  speechRestartTimer.value = null
}

function resetSpeechRestartAttempts() {
  speechRestartAttempts.value = 0
  speechErrorDuringCurrentRun.value = false
}

function toggleSpeechAutoSend() {
  speechAutoSendEnabled.value = !speechAutoSendEnabled.value
}

function toggleTextToSpeech() {
  textToSpeechEnabled.value = !textToSpeechEnabled.value

  if (!textToSpeechEnabled.value && typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel()
    textToSpeechSpeaking.value = false
  }
}

function toggleVisualBot() {
  visualBotVisible.value = !visualBotVisible.value
}

function toggleNavigation() {
  navigationEnabled.value = !navigationEnabled.value
}

function selectTextToSpeechVoice(voiceURI: string) {
  selectedVoiceURI.value = voiceURI

  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }
}

function speakAssistantMessage(message: string) {
  if (!textToSpeechEnabled.value || typeof window === 'undefined' || !window.speechSynthesis) {
    return
  }

  currentTextToSpeechId.value += 1
  const utteranceId = currentTextToSpeechId.value
  const utterance = new SpeechSynthesisUtterance(message)
  utterance.lang = selectedVoice.value?.lang ?? 'es-AR'
  utterance.onstart = () => {
    if (utteranceId !== currentTextToSpeechId.value) {
      return
    }

    textToSpeechSpeaking.value = true
  }
  utterance.onend = () => {
    if (utteranceId !== currentTextToSpeechId.value) {
      return
    }

    textToSpeechSpeaking.value = false
  }
  utterance.onerror = () => {
    if (utteranceId !== currentTextToSpeechId.value) {
      return
    }

    textToSpeechSpeaking.value = false
  }

  if (selectedVoice.value) {
    utterance.voice = selectedVoice.value
  }

  window.speechSynthesis.cancel()
  textToSpeechSpeaking.value = false
  window.speechSynthesis.speak(utterance)
}

async function sendSpeechMessageAutomatically() {
  if (!speechAutoSendEnabled.value) {
    return
  }

  await nextTick()

  if (loading.value || speechAutoSending.value) {
    speechAutoSendPending.value = input.value.trim().length > 0
    return
  }

  if (!canSend.value) {
    return
  }

  speechAutoSending.value = true
  try {
    await sendMessage()
  } finally {
    speechAutoSending.value = false
    await sendPendingSpeechMessage()
  }
}

async function sendPendingSpeechMessage() {
  if (!speechAutoSendPending.value || speechAutoSending.value || loading.value) {
    return
  }

  speechAutoSendPending.value = false
  await sendSpeechMessageAutomatically()
}

function appendSpeechText(transcript: string) {
  const normalizedTranscript = transcript.trim()

  if (!normalizedTranscript) {
    return
  }

  input.value = input.value.trim()
    ? `${input.value.trim()} ${normalizedTranscript}`
    : normalizedTranscript
}

function getSpeechErrorMessage(speechRecognitionError: string) {
  switch (speechRecognitionError) {
    case 'not-allowed':
    case 'service-not-allowed':
      return 'El navegador no tiene permiso para usar el microfono.'
    case 'no-speech':
      return 'No se detecto voz. Proba de nuevo.'
    case 'audio-capture':
      return 'No se encontro un microfono disponible.'
    case 'network':
      return 'No se pudo conectar con el servicio de reconocimiento de voz.'
    default:
      return 'No se pudo completar el dictado por voz.'
  }
}

function isFatalSpeechRecognitionError(speechRecognitionError?: string) {
  return speechRecognitionError === 'not-allowed'
    || speechRecognitionError === 'service-not-allowed'
    || speechRecognitionError === 'audio-capture'
}

function shouldLimitSpeechRestart(speechRecognitionError: string) {
  return speechRecognitionError !== 'no-speech'
}

onMounted(() => {
  loadAgents()
  setupSpeechRecognition()
  setupTextToSpeech()
})

onBeforeUnmount(() => {
  clearSpeechRestartTimer()

  if (speechRecognition.value) {
    speechRecognition.value.abort()
  }

  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel()
    window.speechSynthesis.onvoiceschanged = null
  }

  textToSpeechSpeaking.value = false
})

</script>

<template>
  <section class="chatbot-task">
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
                aria-label="Elegir voz"
                :title="`Elegir voz: ${selectedVoiceName}`"
              />
            </template>

            <v-list density="compact" class="chatbot-task__voice-list">
              <v-list-subheader>Voces disponibles</v-list-subheader>
              <v-list-item
                v-for="voice in textToSpeechVoices"
                :key="voice.voiceURI"
                :active="voice.voiceURI === selectedVoiceURI"
                @click="selectTextToSpeechVoice(voice.voiceURI)"
              >
                <template #prepend>
                  <v-icon
                    :icon="voice.voiceURI === selectedVoiceURI ? 'mdi-check' : 'mdi-account-voice'"
                    size="small"
                  />
                </template>
                <v-list-item-title>{{ voice.name }}</v-list-item-title>
                <v-list-item-subtitle>{{ voice.lang }}</v-list-item-subtitle>
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
      <div ref="messagesContainer" class="chatbot-task__messages">
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

      <VisualBot
        :visible="visualBotVisible"
        :speaking="textToSpeechSpeaking"
      />
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

.chatbot-task__voice-list {
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

.chatbot-task__conversation .visual-bot {
  --visual-bot-scale: 0.5;

  position: absolute;
  right: 10px;
  bottom: 10px;
  z-index: 1;
  opacity: 0.86;
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
  padding-right: 92px;
  padding-bottom: 92px;
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
