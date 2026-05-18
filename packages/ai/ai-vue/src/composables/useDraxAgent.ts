import {computed, nextTick, onBeforeUnmount, onMounted, ref} from 'vue'
import {useRouter} from 'vue-router'
import {AgentProvider} from '@drax/ai-front'
import type {IAgentOption} from '@drax/ai-front'

export interface ChatMessage {
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

const initialAssistantMessage = 'Hola. Decime que tarea queres registrar y la guardo por vos.'
const defaultAgents: IAgentOption[] = [{identifier: 'default', description: ''}]
const maxSpeechRestartAttempts = 3
const textToSpeechMicrophoneResumeDelayMs = 700
const textToSpeechProgressIntervalMs = 80
const textToSpeechBoundaryStaleMs = 900

export function useDraxAgent() {
  const router = useRouter()
  const sessionId = ref<string>()
  const agents = ref<IAgentOption[]>([...defaultAgents])
  const selectedAgentIdentifier = ref('default')
  const agentsLoading = ref(false)
  const messages = ref<ChatMessage[]>([
    {
      role: 'assistant',
      content: initialAssistantMessage,
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
  const speechPressToTalkActive = ref(false)
  const speechSendOnStop = ref(false)
  const speechRestartTimer = ref<number | null>(null)
  const speechRestartAttempts = ref(0)
  const speechErrorDuringCurrentRun = ref(false)
  const speechPausedForTextToSpeech = ref(false)
  const speechResumeTimer = ref<number | null>(null)
  const speechInputMutedUntil = ref(0)
  const textToSpeechSupported = ref(false)
  const textToSpeechEnabled = ref(true)
  const textToSpeechSpeaking = ref(false)
  const textToSpeechVoices = ref<SpeechSynthesisVoice[]>([])
  const textToSpeechMessage = ref(initialAssistantMessage)
  const textToSpeechCharIndex = ref(initialAssistantMessage.length)
  const textToSpeechStartedAt = ref(0)
  const textToSpeechEstimatedDurationMs = ref(0)
  const textToSpeechLastBoundaryAt = ref(0)
  const textToSpeechProgressTimer = ref<number | null>(null)
  const currentTextToSpeechId = ref(0)
  const selectedVoiceURI = ref<string | null>(null)
  const visualBotVisible = ref(true)
  const navigationEnabled = ref(true)

  const canSend = computed(() => input.value.trim().length > 0 && !loading.value)
  const speechButtonIcon = computed(() => speechEnabled.value ? 'mdi-microphone-off' : 'mdi-microphone')
  const speechButtonLabel = computed(() => speechEnabled.value ? 'Apagar microfono' : 'Prender microfono')
  const compactSpeechStatusLabel = computed(() => {
    if (speechError.value) {
      return 'Error'
    }

    if (loading.value) {
      return 'Procesando'
    }

    if (textToSpeechSpeaking.value) {
      return 'Hablando'
    }

    return speechEnabled.value ? 'Activo' : 'Micro'
  })
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
  const currentAssistantMessage = computed(() => {
    for (let index = messages.value.length - 1; index >= 0; index -= 1) {
      const message = messages.value[index]
      if (message?.role === 'assistant') {
        return message.content
      }
    }

    return initialAssistantMessage
  })
  const assistantSpeechMessage = computed(() => textToSpeechSpeaking.value
    ? textToSpeechMessage.value
    : currentAssistantMessage.value)
  const assistantSpeechCharIndex = computed(() => {
    if (!textToSpeechSpeaking.value) {
      return assistantSpeechMessage.value.length
    }

    return Math.min(textToSpeechCharIndex.value, assistantSpeechMessage.value.length)
  })
  const assistantSpeechSpokenText = computed(() => assistantSpeechMessage.value.slice(0, assistantSpeechCharIndex.value))
  const assistantSpeechPendingText = computed(() => assistantSpeechMessage.value.slice(assistantSpeechCharIndex.value))

  async function loadAgents() {
    agentsLoading.value = true

    try {
      const response = await AgentProvider.instance.listAgents()
      agents.value = response.agents.length > 0
        ? response.agents
        : [...defaultAgents]

      if (!agents.value.some((agent) => agent.identifier === selectedAgentIdentifier.value)) {
        selectedAgentIdentifier.value = agents.value[0]?.identifier ?? 'default'
      }
    } catch {
      agents.value = [...defaultAgents]
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
        content: initialAssistantMessage,
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
      if (speechPausedForTextToSpeech.value) {
        return
      }
      if (speechSendOnStop.value) {
        speechSendOnStop.value = false
        void sendSpeechMessageAutomatically()
        return
      }
      if (speechErrorDuringCurrentRun.value) {
        return
      }
      startSpeechRecognitionIfEnabled()
    }
    recognition.onerror = (event) => {
      speechListening.value = false
      interimSpeech.value = ''
      if (speechPausedForTextToSpeech.value) {
        return
      }
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
      if (isSpeechInputMuted()) {
        interimSpeech.value = ''
        return
      }

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
        if (speechPressToTalkActive.value) {
          return
        }
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

  function startPressToTalk() {
    if (!speechRecognition.value || loading.value || speechPressToTalkActive.value) {
      return
    }

    speechPressToTalkActive.value = true
    speechSendOnStop.value = false
    speechEnabled.value = true
    speechError.value = null
    resetSpeechRestartAttempts()
    startSpeechRecognition()
  }

  function stopPressToTalk() {
    if (!speechPressToTalkActive.value) {
      return
    }

    speechPressToTalkActive.value = false
    speechSendOnStop.value = true
    speechEnabled.value = false
    clearSpeechRestartTimer()
    resetSpeechRestartAttempts()

    if (speechListening.value && speechRecognition.value) {
      speechRecognition.value.stop()
      return
    }

    speechSendOnStop.value = false
    void sendSpeechMessageAutomatically()
  }

  function startSpeechRecognition() {
    if (!speechRecognition.value || speechListening.value) {
      return
    }

    if (textToSpeechSpeaking.value || speechPausedForTextToSpeech.value) {
      speechPausedForTextToSpeech.value = true
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
      || speechPausedForTextToSpeech.value
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

  function clearSpeechResumeTimer() {
    if (speechResumeTimer.value === null) {
      return
    }

    window.clearTimeout(speechResumeTimer.value)
    speechResumeTimer.value = null
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

    if (!textToSpeechEnabled.value) {
      stopTextToSpeech()
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

    stopTextToSpeech()
  }

  function stopTextToSpeech() {
    currentTextToSpeechId.value += 1

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }

    clearTextToSpeechProgressTimer()
    textToSpeechSpeaking.value = false
    textToSpeechCharIndex.value = textToSpeechMessage.value.length
    resumeSpeechRecognitionAfterTextToSpeech()
  }

  function speakAssistantMessage(message: string) {
    if (!textToSpeechEnabled.value || typeof window === 'undefined' || !window.speechSynthesis) {
      return
    }

    currentTextToSpeechId.value += 1
    const utteranceId = currentTextToSpeechId.value
    const utterance = new SpeechSynthesisUtterance(message)
    utterance.lang = selectedVoice.value?.lang ?? 'es-AR'
    textToSpeechMessage.value = message
    textToSpeechCharIndex.value = 0
    textToSpeechStartedAt.value = 0
    textToSpeechEstimatedDurationMs.value = estimateSpeechDurationMs(message)
    textToSpeechLastBoundaryAt.value = 0
    utterance.onstart = () => {
      if (utteranceId !== currentTextToSpeechId.value) {
        return
      }

      textToSpeechSpeaking.value = true
      textToSpeechStartedAt.value = performance.now()
      startTextToSpeechProgressTimer(utteranceId, message)
    }
    utterance.onboundary = (event) => {
      if (utteranceId !== currentTextToSpeechId.value) {
        return
      }

      textToSpeechLastBoundaryAt.value = performance.now()
      textToSpeechCharIndex.value = Math.max(
        textToSpeechCharIndex.value,
        getSpeechBoundaryEndIndex(message, event.charIndex, event.charLength),
      )
    }
    utterance.onend = () => {
      textToSpeechCharIndex.value = message.length
      finishTextToSpeech(utteranceId)
    }
    utterance.onerror = () => {
      finishTextToSpeech(utteranceId)
    }

    if (selectedVoice.value) {
      utterance.voice = selectedVoice.value
    }

    window.speechSynthesis.cancel()
    clearTextToSpeechProgressTimer()
    textToSpeechSpeaking.value = false
    pauseSpeechRecognitionForTextToSpeech()
    window.speechSynthesis.speak(utterance)
  }

  function startTextToSpeechProgressTimer(utteranceId: number, message: string) {
    clearTextToSpeechProgressTimer()
    textToSpeechProgressTimer.value = window.setInterval(() => {
      updateEstimatedTextToSpeechProgress(utteranceId, message)
    }, textToSpeechProgressIntervalMs)
  }

  function clearTextToSpeechProgressTimer() {
    if (textToSpeechProgressTimer.value === null) {
      return
    }

    window.clearInterval(textToSpeechProgressTimer.value)
    textToSpeechProgressTimer.value = null
  }

  function updateEstimatedTextToSpeechProgress(utteranceId: number, message: string) {
    if (
      utteranceId !== currentTextToSpeechId.value
      || !textToSpeechSpeaking.value
      || !textToSpeechStartedAt.value
      || textToSpeechCharIndex.value >= message.length
    ) {
      return
    }

    const now = performance.now()
    const boundaryIsFresh = textToSpeechLastBoundaryAt.value > 0
      && now - textToSpeechLastBoundaryAt.value < textToSpeechBoundaryStaleMs

    if (boundaryIsFresh) {
      return
    }

    const elapsedMs = now - textToSpeechStartedAt.value
    const estimatedIndex = getEstimatedSpeechCharIndex(message, elapsedMs, textToSpeechEstimatedDurationMs.value)

    if (estimatedIndex > textToSpeechCharIndex.value) {
      textToSpeechCharIndex.value = estimatedIndex
    }
  }

  function getSpeechBoundaryEndIndex(message: string, charIndex: number, charLength?: number) {
    const startIndex = Math.max(0, Math.min(charIndex, message.length))

    if (typeof charLength === 'number' && Number.isFinite(charLength) && charLength > 0) {
      return Math.min(startIndex + charLength, message.length)
    }

    const nextBreakMatch = message.slice(startIndex).match(/[\s.,;:!?)]/)

    return nextBreakMatch?.index === undefined
      ? message.length
      : Math.min(startIndex + nextBreakMatch.index + 1, message.length)
  }

  function getEstimatedSpeechCharIndex(message: string, elapsedMs: number, durationMs: number) {
    if (durationMs <= 0) {
      return message.length
    }

    const progress = Math.min(elapsedMs / durationMs, 1)
    const rawIndex = Math.floor(message.length * progress)

    return getReadableSpeechCharIndex(message, rawIndex)
  }

  function getReadableSpeechCharIndex(message: string, rawIndex: number) {
    const clampedIndex = Math.max(0, Math.min(rawIndex, message.length))

    if (clampedIndex === 0 || clampedIndex === message.length) {
      return clampedIndex
    }

    const nextSpaceIndex = message.indexOf(' ', clampedIndex)

    if (nextSpaceIndex === -1) {
      return message.length
    }

    return nextSpaceIndex + 1
  }

  function estimateSpeechDurationMs(message: string) {
    const words = message.trim().split(/\s+/).filter(Boolean).length
    const punctuationPauses = (message.match(/[.,;:!?]/g)?.length ?? 0) * 120
    const wordDurationMs = words * 360

    return Math.max(900, wordDurationMs + punctuationPauses)
  }

  function pauseSpeechRecognitionForTextToSpeech() {
    if (!speechRecognition.value || !speechEnabled.value) {
      return
    }

    clearSpeechRestartTimer()
    clearSpeechResumeTimer()
    speechPausedForTextToSpeech.value = true
    interimSpeech.value = ''

    if (speechListening.value) {
      speechRecognition.value.stop()
    }
  }

  function finishTextToSpeech(utteranceId: number) {
    if (utteranceId !== currentTextToSpeechId.value) {
      return
    }

    clearTextToSpeechProgressTimer()
    textToSpeechSpeaking.value = false
    resumeSpeechRecognitionAfterTextToSpeech()
  }

  function resumeSpeechRecognitionAfterTextToSpeech() {
    if (!speechPausedForTextToSpeech.value) {
      return
    }

    speechPausedForTextToSpeech.value = false
    speechInputMutedUntil.value = Date.now() + textToSpeechMicrophoneResumeDelayMs

    if (!speechEnabled.value || !speechRecognition.value) {
      return
    }

    clearSpeechResumeTimer()
    speechResumeTimer.value = window.setTimeout(() => {
      speechResumeTimer.value = null
      startSpeechRecognitionIfEnabled()
    }, textToSpeechMicrophoneResumeDelayMs)
  }

  function isSpeechInputMuted() {
    return speechPausedForTextToSpeech.value
      || textToSpeechSpeaking.value
      || Date.now() < speechInputMutedUntil.value
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
    clearSpeechResumeTimer()

    if (speechRecognition.value) {
      speechRecognition.value.abort()
    }

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
      window.speechSynthesis.onvoiceschanged = null
    }

    clearTextToSpeechProgressTimer()
    textToSpeechSpeaking.value = false
    textToSpeechCharIndex.value = textToSpeechMessage.value.length
    speechPressToTalkActive.value = false
    speechSendOnStop.value = false
  })

  return {
    agentSelectItems,
    agents,
    agentsLoading,
    assistantSpeechCharIndex,
    assistantSpeechMessage,
    assistantSpeechPendingText,
    assistantSpeechSpokenText,
    canSend,
    compactSpeechStatusLabel,
    currentAssistantMessage,
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
    selectTextToSpeechVoice,
    selectedAgent,
    selectedAgentIdentifier,
    selectedVoice,
    selectedVoiceName,
    selectedVoiceURI,
    sendMessage,
    sessionId,
    showAgentSelector,
    speechAutoSendEnabled,
    speechAutoSendLabel,
    speechButtonIcon,
    speechButtonLabel,
    speechEnabled,
    speechError,
    speechPressToTalkActive,
    speechSupported,
    startPressToTalk,
    startNewSession,
    stopPressToTalk,
    stopTextToSpeech,
    textToSpeechEnabled,
    textToSpeechSpeaking,
    textToSpeechSupported,
    textToSpeechVoices,
    toggleNavigation,
    toggleSpeechAutoSend,
    toggleSpeechRecognition,
    toggleTextToSpeech,
    toggleVisualBot,
    visualBotButtonLabel,
    visualBotVisible,
  }
}
