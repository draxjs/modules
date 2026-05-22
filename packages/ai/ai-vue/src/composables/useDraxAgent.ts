import {computed, nextTick, onBeforeUnmount, onMounted, ref} from 'vue'
import {useRouter} from 'vue-router'
import {AgentProvider, TTSProvider, TTSVoiceProvider} from '@drax/ai-front'
import type {IAgentOption, IAIPromptAudioParams, IAIPromptAudioResponse, ITTSProviderInfo, ITTSVoice} from '@drax/ai-front'

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
const browserTextToSpeechProviderName = 'browser'
const browserTextToSpeechVoiceValue = 'WebSpeechAPI'
const textToSpeechProviderStorageKey = 'drax.tts.selectedProvider'
const textToSpeechVoiceStorageKey = 'drax.tts.selectedVoice'
const browserTextToSpeechProvider: ITTSProviderInfo = {
  name: browserTextToSpeechProviderName,
  label: 'Nativo del navegador',
}

function safeLocalStorageGet(key: string) {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeLocalStorageSet(key: string, value: string) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(key, value)
  } catch {
    // Preference persistence is optional.
  }
}

function readStoredTextToSpeechProvider() {
  return safeLocalStorageGet(textToSpeechProviderStorageKey) || browserTextToSpeechProviderName
}

function readStoredTextToSpeechVoice() {
  return safeLocalStorageGet(textToSpeechVoiceStorageKey)
}

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
  const browserTextToSpeechSupported = ref(false)
  const textToSpeechSupported = ref(false)
  const textToSpeechEnabled = ref(true)
  const textToSpeechSpeaking = ref(false)
  const textToSpeechVoices = ref<SpeechSynthesisVoice[]>([])
  const configuredTextToSpeechVoices = ref<ITTSVoice[]>([])
  const textToSpeechProviders = ref<ITTSProviderInfo[]>([browserTextToSpeechProvider])
  const textToSpeechProvidersLoading = ref(false)
  const textToSpeechVoicesLoading = ref(false)
  const selectedTextToSpeechProvider = ref(readStoredTextToSpeechProvider())
  const storedTextToSpeechVoice = readStoredTextToSpeechVoice()
  const selectedTextToSpeechVoiceId = ref<string | null>(
    storedTextToSpeechVoice === browserTextToSpeechVoiceValue || storedTextToSpeechVoice?.startsWith('browser:')
      ? null
      : storedTextToSpeechVoice,
  )
  const textToSpeechAudio = ref<HTMLAudioElement | null>(null)
  const textToSpeechAudioObjectUrl = ref<string | null>(null)
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
  const selectedTextToSpeechVoice = computed(() => {
    if (!selectedTextToSpeechVoiceId.value) {
      return null
    }

    return configuredTextToSpeechVoices.value.find((voice) => voice._id === selectedTextToSpeechVoiceId.value) ?? null
  })
  const selectedVoice = computed<SpeechSynthesisVoice | null>(() => {
    return null
  })
  const selectedVoiceName = computed(() => selectedTextToSpeechVoice.value?.name ?? 'WebSpeechAPI')
  const selectedTextToSpeechProviderInfo = computed(() => textToSpeechProviders.value.find((provider) => (
    provider.name === selectedTextToSpeechProvider.value
  )) ?? browserTextToSpeechProvider)
  const selectedTextToSpeechProviderLabel = computed(() => selectedTextToSpeechProviderInfo.value.label)
  const textToSpeechVoiceItems = computed(() => {
    const browserVoiceItem = {
      title: 'WebSpeechAPI',
      subtitle: 'Voz default del navegador',
      value: browserTextToSpeechVoiceValue,
      props: {
        disabled: !browserTextToSpeechSupported.value,
      },
    }

    return [
      browserVoiceItem,
      ...configuredTextToSpeechVoices.value.map((voice) => ({
        title: voice.name,
        subtitle: [voice.ttsProvider, voice.model, voice.languageCode].filter(Boolean).join(' - '),
        value: voice._id,
        props: {
          disabled: false,
        },
      })),
    ]
  })
  const selectedTextToSpeechVoiceLabel = computed(() => selectedVoiceName.value)
  const selectedTextToSpeechVoiceSelection = computed(() => (
    selectedTextToSpeechVoiceId.value ?? browserTextToSpeechVoiceValue
  ))
  const textToSpeechProviderItems = computed(() => textToSpeechProviders.value.map((provider) => ({
    title: provider.label,
    value: provider.name,
    props: {
      disabled: provider.name === browserTextToSpeechProviderName && !browserTextToSpeechSupported.value,
    },
  })))
  const isBrowserTextToSpeechSelected = computed(() => selectedTextToSpeechProvider.value === browserTextToSpeechProviderName)
  const isBrowserVoiceSelected = computed(() => !selectedTextToSpeechVoice.value || isBrowserTextToSpeechSelected.value)
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
      const response = await AgentProvider.instance.sendMessage(
        message,
        sessionId.value,
        selectedAgentIdentifier.value,
        buildPromptAudioResponseParams(),
      )
      sessionId.value = response.sessionId
      messages.value.push({role: 'assistant', content: response.message})
      await navigateAgentResponse(response.navigationPath)
      speakAssistantMessage(response.message, response.audio)
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
    recognition.lang = 'es'
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
      updateTextToSpeechSupported()
      return
    }

    browserTextToSpeechSupported.value = true
    updateTextToSpeechSupported()
    loadTextToSpeechVoices()
    window.speechSynthesis.onvoiceschanged = loadTextToSpeechVoices
  }

  async function loadTextToSpeechProviders() {
    textToSpeechProvidersLoading.value = true

    try {
      const response = await TTSProvider.instance.availableProviders()
      const externalProviders = response.providers.filter((provider) => provider.name !== browserTextToSpeechProviderName)
      textToSpeechProviders.value = [browserTextToSpeechProvider, ...externalProviders]

      if (!textToSpeechProviders.value.some((provider) => provider.name === selectedTextToSpeechProvider.value)) {
        selectedTextToSpeechProvider.value = browserTextToSpeechProviderName
      }
    } catch {
      textToSpeechProviders.value = [browserTextToSpeechProvider]
      selectedTextToSpeechProvider.value = browserTextToSpeechProviderName
    } finally {
      textToSpeechProvidersLoading.value = false
      updateTextToSpeechSupported()
    }
  }

  async function loadConfiguredTextToSpeechVoices() {
    textToSpeechVoicesLoading.value = true

    try {
      configuredTextToSpeechVoices.value = await TTSVoiceProvider.instance.find({
        limit: 200,
        orderBy: 'name',
        order: 'asc',
      })
      syncSelectedConfiguredTextToSpeechVoice()
    } catch {
      configuredTextToSpeechVoices.value = []
    } finally {
      textToSpeechVoicesLoading.value = false
      updateTextToSpeechSupported()
    }
  }

  function syncSelectedConfiguredTextToSpeechVoice() {
    if (!selectedTextToSpeechVoiceId.value) {
      selectedTextToSpeechVoiceId.value = null
      selectedTextToSpeechProvider.value = browserTextToSpeechProviderName
      return
    }

    const selectedConfiguredVoice = configuredTextToSpeechVoices.value.find((voice) => voice._id === selectedTextToSpeechVoiceId.value)

    if (!selectedConfiguredVoice) {
      selectedTextToSpeechVoiceId.value = null
      selectedTextToSpeechProvider.value = browserTextToSpeechProviderName
      return
    }

    selectedTextToSpeechVoiceId.value = selectedConfiguredVoice._id
    applyConfiguredTextToSpeechVoice(selectedConfiguredVoice)
  }

  function updateTextToSpeechSupported() {
    textToSpeechSupported.value = browserTextToSpeechSupported.value
      || textToSpeechProviders.value.length > 1
      || configuredTextToSpeechVoices.value.length > 0
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

  function selectTextToSpeechVoice(value: unknown) {
    const voiceValue = typeof value === 'string' ? value : null

    if (!voiceValue) {
      return
    }

    if (voiceValue === browserTextToSpeechVoiceValue) {
      selectedTextToSpeechVoiceId.value = null
      selectedTextToSpeechProvider.value = browserTextToSpeechProviderName
      safeLocalStorageSet(textToSpeechProviderStorageKey, browserTextToSpeechProviderName)
      safeLocalStorageSet(textToSpeechVoiceStorageKey, browserTextToSpeechVoiceValue)
      stopTextToSpeech()
      return
    }

    const configuredVoice = configuredTextToSpeechVoices.value.find((voice) => voice._id === voiceValue)

    if (!configuredVoice) {
      return
    }

    selectedTextToSpeechVoiceId.value = configuredVoice._id
    safeLocalStorageSet(textToSpeechVoiceStorageKey, configuredVoice._id)
    applyConfiguredTextToSpeechVoice(configuredVoice)

    stopTextToSpeech()
  }

  function applyConfiguredTextToSpeechVoice(voice: ITTSVoice) {
    selectedTextToSpeechProvider.value = voice.ttsProvider
    safeLocalStorageSet(textToSpeechProviderStorageKey, voice.ttsProvider)
  }

  function selectTextToSpeechProvider(value: unknown) {
    const providerName = typeof value === 'string' ? value : null

    if (!providerName) {
      return
    }

    if (providerName === browserTextToSpeechProviderName && !browserTextToSpeechSupported.value) {
      return
    }

    if (!textToSpeechProviders.value.some((provider) => provider.name === providerName)) {
      selectedTextToSpeechProvider.value = browserTextToSpeechProviderName
      return
    }

    safeLocalStorageSet(textToSpeechProviderStorageKey, providerName)

    if (providerName === selectedTextToSpeechProvider.value) {
      return
    }

    selectedTextToSpeechProvider.value = providerName
    stopTextToSpeech()
  }

  function buildPromptAudioResponseParams(): IAIPromptAudioParams | undefined {
    if (!textToSpeechEnabled.value || isBrowserVoiceSelected.value) {
      return undefined
    }

    const voice = selectedTextToSpeechVoice.value

    return {
      provider: voice?.ttsProvider ?? selectedTextToSpeechProvider.value,
      voiceId: voice?.voiceId,
      model: voice?.model ?? undefined,
      languageCode: voice?.languageCode ?? 'es',
      operationTitle: 'drax-agent-tts',
      operationGroup: 'drax-agent',
    }
  }

  function stopTextToSpeech() {
    currentTextToSpeechId.value += 1

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }

    stopTextToSpeechAudio()
    clearTextToSpeechProgressTimer()
    textToSpeechSpeaking.value = false
    textToSpeechCharIndex.value = textToSpeechMessage.value.length
    resumeSpeechRecognitionAfterTextToSpeech()
  }

  function speakAssistantMessage(message: string, audioResponse?: IAIPromptAudioResponse) {
    if (!textToSpeechEnabled.value || typeof window === 'undefined' || !textToSpeechSupported.value) {
      return
    }

    if (!isBrowserVoiceSelected.value) {
      void speakAssistantMessageWithProvider(message, audioResponse)
      return
    }

    if (!window.speechSynthesis) {
      return
    }

    currentTextToSpeechId.value += 1
    const utteranceId = currentTextToSpeechId.value
    const utterance = new SpeechSynthesisUtterance(message)
    utterance.lang = selectedVoice.value?.lang ?? 'es'
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

  async function speakAssistantMessageWithProvider(message: string, audioResponse?: IAIPromptAudioResponse) {
    currentTextToSpeechId.value += 1
    const audioId = currentTextToSpeechId.value
    const voice = selectedTextToSpeechVoice.value
    textToSpeechMessage.value = message
    textToSpeechCharIndex.value = 0
    textToSpeechStartedAt.value = 0
    textToSpeechEstimatedDurationMs.value = estimateSpeechDurationMs(message)
    textToSpeechLastBoundaryAt.value = 0

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }

    stopTextToSpeechAudio()
    clearTextToSpeechProgressTimer()
    textToSpeechSpeaking.value = false
    pauseSpeechRecognitionForTextToSpeech()

    try {
      const objectUrl = audioResponse
        ? createAudioObjectUrl(audioResponse)
        : await TTSProvider.instance.textToSpeechObjectUrl({
          text: message,
          provider: voice?.ttsProvider ?? selectedTextToSpeechProvider.value,
          voiceId: voice?.voiceId,
          model: voice?.model ?? undefined,
          languageCode: voice?.languageCode ?? 'es',
          operationTitle: 'drax-agent-tts',
          operationGroup: 'drax-agent',
        })

      if (audioId !== currentTextToSpeechId.value) {
        URL.revokeObjectURL(objectUrl)
        return
      }

      textToSpeechAudioObjectUrl.value = objectUrl
      const audio = new Audio(objectUrl)
      textToSpeechAudio.value = audio
      audio.onplaying = () => {
        if (audioId !== currentTextToSpeechId.value) {
          return
        }

        textToSpeechSpeaking.value = true
        textToSpeechStartedAt.value = performance.now()
        startTextToSpeechProgressTimer(audioId, message)
      }
      audio.onended = () => {
        textToSpeechCharIndex.value = message.length
        finishTextToSpeech(audioId)
      }
      audio.onerror = () => {
        finishTextToSpeech(audioId)
      }

      await audio.play()
    } catch {
      finishTextToSpeech(audioId)
    }
  }

  function stopTextToSpeechAudio() {
    if (textToSpeechAudio.value) {
      textToSpeechAudio.value.onplay = null
      textToSpeechAudio.value.onplaying = null
      textToSpeechAudio.value.onended = null
      textToSpeechAudio.value.onerror = null
      textToSpeechAudio.value.pause()
      textToSpeechAudio.value.src = ''
      textToSpeechAudio.value.load()
      textToSpeechAudio.value = null
    }

    if (textToSpeechAudioObjectUrl.value) {
      URL.revokeObjectURL(textToSpeechAudioObjectUrl.value)
      textToSpeechAudioObjectUrl.value = null
    }
  }

  function createAudioObjectUrl(audioResponse: IAIPromptAudioResponse) {
    const byteCharacters = atob(audioResponse.audio)
    const byteArrays: ArrayBuffer[] = []

    for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
      const slice = byteCharacters.slice(offset, offset + 1024)
      const byteNumbers = new Array(slice.length)

      for (let index = 0; index < slice.length; index += 1) {
        byteNumbers[index] = slice.charCodeAt(index)
      }

      byteArrays.push(new Uint8Array(byteNumbers).buffer)
    }

    return URL.createObjectURL(new Blob(byteArrays, {type: audioResponse.contentType}))
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
    stopTextToSpeechAudio()
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
    loadTextToSpeechProviders()
    loadConfiguredTextToSpeechVoices()
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
    stopTextToSpeechAudio()
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
    selectTextToSpeechProvider,
    selectTextToSpeechVoice,
    selectedAgent,
    selectedAgentIdentifier,
    selectedTextToSpeechProvider,
    selectedTextToSpeechProviderLabel,
    selectedTextToSpeechVoice,
    selectedTextToSpeechVoiceId,
    selectedTextToSpeechVoiceLabel,
    selectedTextToSpeechVoiceSelection,
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
    textToSpeechProviderItems,
    textToSpeechProviders,
    textToSpeechProvidersLoading,
    textToSpeechSpeaking,
    textToSpeechSupported,
    textToSpeechVoiceItems,
    textToSpeechVoicesLoading,
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
