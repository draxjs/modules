import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {defineComponent, h} from 'vue'
import {flushPromises, mount, type VueWrapper} from '@vue/test-utils'
import type {IAgentListResponse, IChatbotTaskMessageResponse, IAIPromptAudioResponse} from '@drax/ai-front'
import {useDraxAgent, type UseDraxAgentOptions} from '../src/composables/useDraxAgent'
import DraxAgent from '../src/components/DraxAgent.vue'
import DraxAgentExpress from '../src/components/DraxAgentExpress.vue'

const mocks = vi.hoisted(() => ({
  listAgents: vi.fn(),
  startSession: vi.fn(),
  sendMessage: vi.fn(),
  ttsProviders: vi.fn(),
  ttsVoices: vi.fn(),
  ttsSynthesize: vi.fn(),
  navigate: vi.fn(),
}))

vi.mock('@drax/ai-front', () => ({
  AgentProvider: {instance: {
    listAgents: mocks.listAgents,
    startSession: mocks.startSession,
    sendMessage: mocks.sendMessage,
  }},
  TTSProvider: {instance: {availableProviders: mocks.ttsProviders, textToSpeechObjectUrl: mocks.ttsSynthesize}},
  TTSVoiceProvider: {instance: {find: mocks.ttsVoices}},
}))
vi.mock('vue-router', () => ({useRouter: () => ({push: mocks.navigate})}))

const agents: IAgentListResponse = {
  agents: [
    {identifier: 'default', description: 'General'},
    {identifier: 'tasks', description: 'Gestion de tareas', type: 'specialist', routing: {
      eligible: true, capabilities: 'private routing instructions', examples: ['private example'],
    }},
    {identifier: 'calendar', description: 'Agenda', type: 'specialist'},
    {identifier: 'auto', description: 'Asistente automatico', type: 'router', routing: {recommended: true}},
  ],
  recommendedAgentIdentifier: 'auto',
}
const reply: IChatbotTaskMessageResponse = {
  agentIdentifier: 'auto', sessionId: 'session-1', message: 'Listo',
  resolvedAgentIdentifier: 'tasks', correlationId: 'turn-1',
  metrics: {tokens: 10, breakdown: {router: {tokens: 2}, specialist: {tokens: 8}}},
}

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })
  return {promise, resolve, reject}
}

const wrappers: VueWrapper[] = []
function setup(options?: UseDraxAgentOptions) {
  let agent!: ReturnType<typeof useDraxAgent>
  const wrapper = mount(defineComponent({
    setup() {
      agent = useDraxAgent(options)
      return () => h('div')
    },
  }))
  wrappers.push(wrapper)
  return agent
}

async function send(agent: ReturnType<typeof useDraxAgent>, message = 'Hola') {
  agent.input.value = message
  await agent.sendMessage()
}

beforeEach(() => {
  mocks.listAgents.mockReset().mockResolvedValue(structuredClone(agents))
  mocks.startSession.mockReset().mockResolvedValue({agentIdentifier: 'auto', sessionId: 'new-session'})
  mocks.sendMessage.mockReset().mockResolvedValue(reply)
  mocks.ttsProviders.mockReset().mockResolvedValue({providers: []})
  mocks.ttsVoices.mockReset().mockResolvedValue([])
  mocks.ttsSynthesize.mockReset().mockResolvedValue('blob:synthesized')
  window.localStorage.clear()
})
afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
  vi.unstubAllGlobals()
})

const returnedAudio: IAIPromptAudioResponse = {
  audio: btoa('returned audio'), contentType: 'audio/mpeg', encoding: 'base64',
  meta: {provider: 'ElevenLabs', model: 'test-model', voiceId: 'test-voice', size: 14, time: 1},
}

function installTextToSpeech() {
  const synthesis = {getVoices: vi.fn(() => []), speak: vi.fn(), cancel: vi.fn(), onvoiceschanged: null}
  vi.stubGlobal('speechSynthesis', synthesis)
  vi.stubGlobal('SpeechSynthesisUtterance', vi.fn(function (text: string) { return {text} }))
  const audio = {
    onplaying: null as (() => void) | null,
    onended: null as (() => void) | null,
    onerror: null as (() => void) | null,
    play: vi.fn(async () => { audio.onplaying?.() }),
    pause: vi.fn(), load: vi.fn(), src: '',
  }
  const audioConstructor = vi.fn(function () { return audio })
  vi.stubGlobal('Audio', audioConstructor)
  const createObjectURL = vi.fn(() => 'blob:returned-audio')
  vi.stubGlobal('URL', class extends URL {
    static createObjectURL = createObjectURL
    static revokeObjectURL = vi.fn()
  })
  mocks.ttsProviders.mockResolvedValue({providers: [{name: 'ElevenLabs', label: 'ElevenLabs'}]})
  mocks.ttsVoices.mockResolvedValue([
    {_id: 'voice-1', name: 'Voz configurada', ttsProvider: 'ElevenLabs', voiceId: 'test-voice'},
  ])
  return {synthesis, audio, audioConstructor, createObjectURL}
}

const responseSources = ['result', 'body', 'wrapped', 'axios'] as const
function mockAgentResponse(source: typeof responseSources[number], payload: Partial<IChatbotTaskMessageResponse>) {
  if (source === 'result') mocks.sendMessage.mockResolvedValue(payload)
  if (source === 'body') mocks.sendMessage.mockRejectedValue({status: 500, body: payload})
  if (source === 'wrapped') mocks.sendMessage.mockRejectedValue({message: 'error.server', error: {status: 500, body: payload}})
  if (source === 'axios') mocks.sendMessage.mockRejectedValue({response: {status: 500, data: payload}})
}

describe('useDraxAgent destinations', () => {
  it('blocks sends, sessions and selection until listing resolves, then uses the recommended router', async () => {
    const listing = deferred<IAgentListResponse>()
    mocks.listAgents.mockReturnValue(listing.promise)
    const agent = setup()
    agent.input.value = 'Conservar este mensaje'
    expect(agent.destinationReady.value).toBe(false)
    expect(agent.agentsLoading.value).toBe(true)
    expect(agent.canSend.value).toBe(false)
    await agent.sendMessage()
    await agent.startNewSession()
    agent.selectAgent('tasks')
    expect(mocks.sendMessage).not.toHaveBeenCalled()
    expect(mocks.startSession).not.toHaveBeenCalled()
    expect(agent.input.value).toBe('Conservar este mensaje')

    listing.resolve(agents)
    await flushPromises()
    expect(agent.destinationReady.value).toBe(true)
    expect(agent.agentsLoading.value).toBe(false)
    expect(agent.selectedAgentIdentifier.value).toBe('auto')
    expect(agent.canSend.value).toBe(true)
    await agent.sendMessage()
    expect(mocks.sendMessage).toHaveBeenCalledWith('Conservar este mensaje', undefined, 'auto', undefined)
    await agent.startNewSession()
    expect(mocks.startSession).toHaveBeenCalledWith('auto')
  })

  it('honors an explicit initial specialist, including during initial loading', async () => {
    const listing = deferred<IAgentListResponse>()
    mocks.listAgents.mockReturnValue(listing.promise)
    const agent = setup({initialAgentIdentifier: 'calendar'})
    await send(agent)
    await agent.startNewSession()
    expect(mocks.sendMessage).not.toHaveBeenCalled()
    expect(mocks.startSession).not.toHaveBeenCalled()
    listing.resolve(agents)
    await flushPromises()
    expect(agent.selectedAgentIdentifier.value).toBe('calendar')
    await agent.sendMessage()
    expect(mocks.sendMessage).toHaveBeenCalledWith('Hola', undefined, 'calendar', undefined)
  })

  it('honors explicit default rather than replacing it with the router', async () => {
    const agent = setup({initialAgentIdentifier: 'default'})
    await flushPromises()
    expect(agent.selectedAgentIdentifier.value).toBe('default')
  })

  it('does not silently redirect an explicit identifier absent from the listing', async () => {
    const agent = setup({initialAgentIdentifier: 'configured-agent'})
    await flushPromises()
    await send(agent)
    expect(mocks.sendMessage).toHaveBeenCalledWith('Hola', undefined, 'configured-agent', undefined)
    expect(agent.selectedAgent.value).toBeUndefined()
  })

  it('supports router recommendation metadata without the top-level recommendation', async () => {
    mocks.listAgents.mockResolvedValue({agents: agents.agents})
    const agent = setup()
    await flushPromises()
    expect(agent.selectedAgentIdentifier.value).toBe('auto')
  })

  it('prefers the valid top-level recommendation over per-agent metadata', async () => {
    mocks.listAgents.mockResolvedValue({
      agents: [...agents.agents, {identifier: 'other-router', description: '', type: 'router'}],
      recommendedAgentIdentifier: 'other-router',
    })
    const agent = setup()
    await flushPromises()
    expect(agent.selectedAgentIdentifier.value).toBe('other-router')
  })

  it('lets users manually select a specialist and resets its conversation as before', async () => {
    const agent = setup()
    await flushPromises()
    await send(agent)
    agent.selectAgent('calendar')
    expect(agent.selectedAgentIdentifier.value).toBe('calendar')
    expect(agent.sessionId.value).toBeUndefined()
    expect(agent.messages.value).toHaveLength(1)
    await send(agent, 'Agenda una cita')
    expect(mocks.sendMessage).toHaveBeenLastCalledWith('Agenda una cita', undefined, 'calendar', undefined)
  })

  it('rejects unknown selections and disables manual selection when configured', async () => {
    const agent = setup({initialAgentIdentifier: 'tasks', allowManualSelection: false})
    await flushPromises()
    expect(agent.showAgentSelector.value).toBe(false)
    agent.selectAgent('calendar')
    expect(agent.selectedAgentIdentifier.value).toBe('tasks')
    const manual = setup()
    await flushPromises()
    manual.selectAgent('unlisted')
    expect(manual.selectedAgentIdentifier.value).toBe('auto')
  })

  it('retains router and session when successive turns resolve to different specialists', async () => {
    const agent = setup()
    await flushPromises()
    await send(agent, 'Tarea')
    mocks.sendMessage.mockResolvedValue({...reply, resolvedAgentIdentifier: 'calendar', correlationId: 'turn-2'})
    await send(agent, 'Cita')
    expect(mocks.sendMessage).toHaveBeenLastCalledWith('Cita', 'session-1', 'auto', undefined)
    expect(agent.selectedAgentIdentifier.value).toBe('auto')
    expect(agent.sessionId.value).toBe('session-1')
    expect(agent.messages.value.filter((message) => message.resolvedAgentIdentifier)
      .map((message) => message.resolvedAgentIdentifier)).toEqual(['tasks', 'calendar'])
    expect(agent.currentResolvedAgentLabel.value).toBe('Agenda')
    expect(agent.messages.value[2]).toMatchObject({correlationId: 'turn-1', metrics: reply.metrics})
  })

  it('blocks selection and overlapping sessions while a message is pending', async () => {
    const pending = deferred<IChatbotTaskMessageResponse>()
    mocks.sendMessage.mockReturnValue(pending.promise)
    const agent = setup()
    await flushPromises()
    const sending = send(agent)
    await flushPromises()
    agent.selectAgent('tasks')
    await agent.startNewSession()
    expect(agent.selectedAgentIdentifier.value).toBe('auto')
    expect(mocks.startSession).not.toHaveBeenCalled()
    pending.resolve(reply)
    await sending
  })

  it.each([
    [{agents: [{identifier: 'legacy', description: ''}, {identifier: 'default', description: ''}]}, 'default'],
    [{agents: [{identifier: 'legacy', description: ''}]}, 'legacy'],
    [{agents: []}, 'default'],
    [{agents: [{identifier: 'legacy', description: ''}], recommendedAgentIdentifier: 'missing'}, 'legacy'],
  ])('keeps the legacy default/first fallback for %j', async (listing, identifier) => {
    mocks.listAgents.mockResolvedValue(listing)
    mocks.sendMessage.mockResolvedValue({sessionId: 'old-session', message: 'Respuesta antigua'})
    const agent = setup()
    await flushPromises()
    expect(agent.selectedAgentIdentifier.value).toBe(identifier)
    await send(agent)
    expect(agent.currentAssistantMessage.value).toBe('Respuesta antigua')
    expect(agent.currentResolvedAgentLabel.value).toBe('')
    expect(agent.selectedAgentIdentifier.value).toBe(identifier)
  })

  it.each([undefined, 'tasks'])('uses legacy fallback after a listing failure, preserving explicit %s', async (identifier) => {
    const listing = deferred<IAgentListResponse>()
    mocks.listAgents.mockReturnValue(listing.promise)
    const agent = setup({initialAgentIdentifier: identifier})
    await send(agent)
    expect(mocks.sendMessage).not.toHaveBeenCalled()
    listing.reject(new Error('Listing unavailable'))
    await flushPromises()
    expect(agent.destinationReady.value).toBe(true)
    expect(agent.selectedAgentIdentifier.value).toBe(identifier || 'default')
    await agent.sendMessage()
    expect(mocks.sendMessage).toHaveBeenCalledWith('Hola', undefined, identifier || 'default', undefined)
  })
})

describe('feature results and existing behavior', () => {
  const featureError = {
    code: 'PERSISTENCE_FAILED', stage: 'persist', message: 'No se pudo guardar la respuesta',
    operationMayHaveCompleted: true,
  }

  it.each(['result', 'body', 'wrapped', 'axios'])('exposes structured failures from %s without retry advice or navigation', async (source) => {
    const payload = {...reply, message: '', error: featureError, navigationPath: '/should-not-navigate'}
    if (source === 'result') mocks.sendMessage.mockResolvedValue(payload)
    if (source === 'body') mocks.sendMessage.mockRejectedValue({body: payload})
    if (source === 'wrapped') mocks.sendMessage.mockRejectedValue({message: 'error.server', error: {body: payload}})
    if (source === 'axios') mocks.sendMessage.mockRejectedValue({response: {data: payload}})
    const agent = setup()
    await flushPromises()
    await send(agent)
    expect(agent.responseError.value).toEqual(featureError)
    expect(agent.correlationId.value).toBe('turn-1')
    expect(agent.error.value).toContain('PERSISTENCE_FAILED')
    expect(agent.error.value).toContain('persist')
    expect(agent.error.value).toContain('turn-1')
    expect(agent.error.value).toContain('Verifica el resultado')
    expect(agent.currentAssistantMessage.value).not.toContain('Proba de nuevo')
    expect(agent.messages.value[2]).toMatchObject({error: featureError, resolvedAgentIdentifier: 'tasks'})
    expect(agent.compactSpeechStatusLabel.value).toBe(agent.error.value)
    expect(agent.selectedAgentIdentifier.value).toBe('auto')
    expect(agent.sessionId.value).toBe('session-1')
    expect(mocks.navigate).not.toHaveBeenCalled()
  })

  it('preserves normal navigation and its toggle', async () => {
    mocks.sendMessage.mockResolvedValue({...reply, navigationPath: '/crud/task?id=1'})
    const agent = setup()
    await flushPromises()
    await send(agent)
    expect(mocks.navigate).toHaveBeenCalledWith('/crud/task?id=1')
    agent.toggleNavigation()
    await send(agent)
    expect(mocks.navigate).toHaveBeenCalledTimes(1)
  })

  it('preserves generic transport errors and clears structured errors on a successful turn', async () => {
    mocks.sendMessage.mockResolvedValueOnce({...reply, error: {...featureError, operationMayHaveCompleted: false}})
    const agent = setup()
    await flushPromises()
    await send(agent)
    await send(agent)
    expect(agent.error.value).toBeNull()
    expect(agent.responseError.value).toBeNull()
    mocks.sendMessage.mockRejectedValue(new Error('Sin conexion'))
    await send(agent)
    expect(agent.error.value).toBe('Sin conexion')
    expect(agent.loading.value).toBe(false)
  })

  it('uses only a brief public description for attribution', async () => {
    const agent = setup()
    await flushPromises()
    expect(agent.getResolvedAgentLabel('tasks')).toBe('Gestion de tareas')
    expect(agent.getResolvedAgentLabel('unknown')).toBe('Asistente')
    agent.agents.value.push({identifier: 'long', description: `  ${'Texto '.repeat(30)}\n`})
    expect(agent.getResolvedAgentLabel('long')).toHaveLength(100)
    expect(agent.getResolvedAgentLabel()).toBe('')
  })
})

describe('error response audio', () => {
  const persistenceError = {
    code: 'PERSISTENCE_FAILED', stage: 'persist', message: 'No se pudo guardar la respuesta',
    operationMayHaveCompleted: true,
  }

  it.each(responseSources)('reuses returned audio and its response text from %s without a second TTS request', async (source) => {
    const {synthesis, audio, audioConstructor, createObjectURL} = installTextToSpeech()
    const payload = {...reply, message: 'La tarea fue creada.', error: persistenceError, audio: returnedAudio,
      navigationPath: '/should-not-navigate'}
    mockAgentResponse(source, payload)
    const agent = setup()
    await flushPromises()
    agent.selectTextToSpeechVoice('voice-1')
    await send(agent)
    await flushPromises()

    expect(agent.textToSpeechSupported.value).toBe(true)
    expect(mocks.sendMessage).toHaveBeenCalledWith('Hola', undefined, 'auto', expect.objectContaining({provider: 'ElevenLabs'}))
    expect(createObjectURL).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({type: 'audio/mpeg', size: 14}))
    expect(audioConstructor).toHaveBeenCalledExactlyOnceWith('blob:returned-audio')
    expect(audio.play).toHaveBeenCalledTimes(1)
    expect(agent.textToSpeechSpeaking.value).toBe(true)
    expect(agent.assistantSpeechMessage.value).toBe(payload.message)
    expect(agent.currentAssistantMessage.value).toBe(payload.message)
    expect(agent.error.value).toContain('PERSISTENCE_FAILED')
    expect(agent.assistantSpeechMessage.value).not.toBe(agent.error.value)
    expect(agent.sessionId.value).toBe('session-1')
    expect(mocks.ttsSynthesize).not.toHaveBeenCalled()
    expect(synthesis.speak).not.toHaveBeenCalled()
    expect(mocks.sendMessage).toHaveBeenCalledTimes(1)
    expect(mocks.startSession).not.toHaveBeenCalled()
    expect(mocks.navigate).not.toHaveBeenCalled()
  })

  describe.each(['browser', 'external'])('%s voice', (voice) => {
    it.each(responseSources)('shows audio-stage failures from %s without any automatic speech or retry', async (source) => {
      const {synthesis, audioConstructor, createObjectURL} = installTextToSpeech()
      const payload = {...reply, message: 'La tarea se registro, pero no se pudo generar el audio.',
        error: {code: 'AUDIO_FAILED', stage: 'audio', message: 'Fallo el proveedor de voz', operationMayHaveCompleted: true}}
      mockAgentResponse(source, payload)
      const agent = setup()
      await flushPromises()
      if (voice === 'external') agent.selectTextToSpeechVoice('voice-1')
      await send(agent)
      await flushPromises()

      expect(agent.textToSpeechSupported.value).toBe(true)
      expect(agent.currentAssistantMessage.value).toBe(payload.message)
      expect(agent.error.value).toContain('AUDIO_FAILED')
      expect(agent.responseError.value).toEqual(payload.error)
      expect(agent.sessionId.value).toBe('session-1')
      expect(agent.textToSpeechSpeaking.value).toBe(false)
      expect(mocks.ttsSynthesize).not.toHaveBeenCalled()
      expect(synthesis.speak).not.toHaveBeenCalled()
      expect(audioConstructor).not.toHaveBeenCalled()
      expect(createObjectURL).not.toHaveBeenCalled()
      expect(mocks.sendMessage).toHaveBeenCalledTimes(1)
      expect(mocks.startSession).not.toHaveBeenCalled()
    })
  })

  it.each(responseSources)('preserves a primary routing error with audioFailed from %s without external synthesis', async (source) => {
    const {synthesis, audioConstructor, createObjectURL} = installTextToSpeech()
    const payload: IChatbotTaskMessageResponse = {
      ...reply, message: 'No hay asistentes disponibles para este pedido.',
      error: {code: 'ROUTER_NO_CANDIDATES', stage: 'routing', message: 'No hay especialistas elegibles', audioFailed: true},
    }
    mockAgentResponse(source, payload)
    const agent = setup()
    await flushPromises()
    agent.selectTextToSpeechVoice('voice-1')
    await send(agent)
    await flushPromises()

    expect(agent.textToSpeechSupported.value).toBe(true)
    expect(mocks.sendMessage).toHaveBeenCalledExactlyOnceWith('Hola', undefined, 'auto', expect.objectContaining({provider: 'ElevenLabs'}))
    expect(agent.currentAssistantMessage.value).toBe(payload.message)
    expect(agent.error.value).toContain('ROUTER_NO_CANDIDATES')
    expect(agent.error.value).toContain('routing')
    expect(agent.responseError.value).toEqual(payload.error)
    expect(agent.messages.value[2]?.error).toEqual(payload.error)
    expect(agent.sessionId.value).toBe('session-1')
    expect(agent.textToSpeechSpeaking.value).toBe(false)
    expect(mocks.ttsSynthesize).not.toHaveBeenCalled()
    expect(synthesis.speak).not.toHaveBeenCalled()
    expect(audioConstructor).not.toHaveBeenCalled()
    expect(createObjectURL).not.toHaveBeenCalled()
    expect(mocks.startSession).not.toHaveBeenCalled()
    expect(mocks.navigate).not.toHaveBeenCalled()
  })

  it('does not retry or fall back to browser synthesis when external error speech fails', async () => {
    const {synthesis, audioConstructor} = installTextToSpeech()
    mocks.ttsSynthesize.mockRejectedValue(new Error('TTS unavailable'))
    mocks.sendMessage.mockResolvedValue({...reply, message: 'No se pudo completar la respuesta.', error: persistenceError})
    const agent = setup()
    await flushPromises()
    agent.selectTextToSpeechVoice('voice-1')
    await send(agent)
    await flushPromises()

    expect(mocks.ttsSynthesize).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({text: agent.error.value}))
    expect(agent.textToSpeechSpeaking.value).toBe(false)
    expect(agent.currentAssistantMessage.value).toBe('No se pudo completar la respuesta.')
    expect(agent.responseError.value).toEqual(persistenceError)
    expect(audioConstructor).not.toHaveBeenCalled()
    expect(synthesis.speak).not.toHaveBeenCalled()
    expect(mocks.sendMessage).toHaveBeenCalledTimes(1)
  })

  it('does not synthesize or retry when playback of returned error audio fails', async () => {
    const {synthesis, audio} = installTextToSpeech()
    audio.play.mockRejectedValue(new Error('Playback unavailable'))
    mockAgentResponse('body', {...reply, error: persistenceError, audio: returnedAudio})
    const agent = setup()
    await flushPromises()
    agent.selectTextToSpeechVoice('voice-1')
    await send(agent)
    await flushPromises()

    expect(audio.play).toHaveBeenCalledTimes(1)
    expect(agent.textToSpeechSpeaking.value).toBe(false)
    expect(agent.currentAssistantMessage.value).toBe(reply.message)
    expect(agent.responseError.value).toEqual(persistenceError)
    expect(mocks.ttsSynthesize).not.toHaveBeenCalled()
    expect(synthesis.speak).not.toHaveBeenCalled()
    expect(mocks.sendMessage).toHaveBeenCalledTimes(1)
  })
})

describe('indeterminate session persistence', () => {
  const sessionError = {
    code: 'SESSION_PERSISTENCE_INDETERMINATE', stage: 'persist', message: 'No se pudo confirmar la sesion',
    operationMayHaveCompleted: true,
  }

  describe.each(responseSources)('%s response', (source) => {
    it.each([
      ['returned session', 'recovered-session', undefined, 'recovered-session'],
      ['legacy without a session', undefined, undefined, undefined],
      ['legacy with an existing session', undefined, 'previous-session', 'previous-session'],
    ])('preserves %s and requires an explicit new session before sending again', async (_, receivedSession, previousSession, expectedSession) => {
      mockAgentResponse(source, {...reply, sessionId: receivedSession, message: '', error: sessionError})
      const agent = setup()
      await flushPromises()
      agent.sessionId.value = previousSession
      await send(agent)
      await flushPromises()

      expect(agent.sessionId.value).toBe(expectedSession)
      expect(agent.responseError.value).toEqual(sessionError)
      expect(agent.error.value).toContain('Verifica el resultado')
      agent.input.value = 'No enviar implicitamente'
      expect(agent.canSend.value).toBe(false)
      await agent.sendMessage()
      await flushPromises()
      expect(mocks.sendMessage).toHaveBeenCalledTimes(1)
      expect(mocks.startSession).not.toHaveBeenCalled()
      expect(agent.input.value).toBe('No enviar implicitamente')

      await agent.startNewSession()
      expect(mocks.startSession).toHaveBeenCalledExactlyOnceWith('auto')
      expect(agent.sessionId.value).toBe('new-session')
      expect(agent.responseError.value).toBeNull()
      expect(agent.canSend.value).toBe(true)
      expect(mocks.sendMessage).toHaveBeenCalledTimes(1)
      mocks.sendMessage.mockResolvedValue(reply)
      await agent.sendMessage()
      expect(mocks.sendMessage).toHaveBeenLastCalledWith('No enviar implicitamente', 'new-session', 'auto', undefined)
    })
  })

  it.each(['transport', 'structured'])('keeps sending blocked if the explicit reset fails with a %s error', async (source) => {
    mockAgentResponse('body', {error: sessionError})
    const agent = setup()
    await flushPromises()
    await send(agent)
    mocks.startSession.mockRejectedValue(source === 'transport'
      ? new Error('Sin conexion')
      : {body: {error: {code: 'SESSION_FAILED', stage: 'session', message: 'No se pudo crear la sesion'}}})
    await agent.startNewSession()
    agent.input.value = 'No abrir otra conversacion'
    expect(agent.responseError.value).toEqual(sessionError)
    expect(agent.canSend.value).toBe(false)
    await agent.sendMessage()
    expect(mocks.sendMessage).toHaveBeenCalledTimes(1)
    expect(agent.sessionId.value).toBeUndefined()
  })

  it('does not automatically submit queued or subsequent speech after an uncertain operation', async () => {
    const recognition = installSpeechRecognition()
    const pending = deferred<IChatbotTaskMessageResponse>()
    mocks.sendMessage.mockReturnValue(pending.promise)
    const agent = setup()
    await flushPromises()
    const sending = send(agent)
    await flushPromises()
    recognition.onresult({resultIndex: 0, results: [{isFinal: true, 0: {transcript: 'Mensaje en cola'}}]})
    await flushPromises()
    expect(agent.input.value).toBe('Mensaje en cola')
    pending.resolve({...reply, error: sessionError})
    await sending
    await flushPromises()
    expect(mocks.sendMessage).toHaveBeenCalledTimes(1)
    expect(agent.sessionId.value).toBe('session-1')
    expect(agent.input.value).toBe('Mensaje en cola')
    recognition.onresult({resultIndex: 0, results: [{isFinal: true, 0: {transcript: 'Otro mensaje'}}]})
    await flushPromises()
    expect(agent.canSend.value).toBe(false)
    expect(mocks.sendMessage).toHaveBeenCalledTimes(1)
    expect(mocks.startSession).not.toHaveBeenCalled()
  })
})

// Lightweight Vuetify stubs keep these component tests independent of layout and network.
const passthrough = defineComponent({
  setup(_, {slots, attrs}) { return () => h('div', attrs, slots.default?.()) },
})
const button = defineComponent({
  inheritAttrs: false,
  setup(_, {slots, attrs}) { return () => h('button', attrs, slots.default?.()) },
})
const global = {
  stubs: {
    VManagerBot: true, VBtn: button, VIcon: true, VCombobox: passthrough, VMenu: passthrough,
    VList: passthrough, VListSubheader: passthrough, VListItem: passthrough,
    VListItemTitle: passthrough, VListItemSubtitle: passthrough, VAlert: passthrough, VTextarea: true,
  },
}

function componentAgent(wrapper: VueWrapper) {
  return (wrapper.vm.$ as unknown as {setupState: {
    input: string
    selectedAgentIdentifier: string
    showAgentSelector: boolean
    sendMessage?: () => Promise<void>
    selectTextToSpeechVoice: (value: unknown) => void
    textToSpeechEnabled: boolean
    textToSpeechSpeaking: boolean
  }}).setupState
}

function installSpeechRecognition() {
  const recognition = {
    onstart: () => {},
    onend: () => {},
    onresult: (_event: {resultIndex: number, results: Array<{isFinal: boolean, 0: {transcript: string}}>}) => {},
    start: vi.fn(() => recognition.onstart()),
    stop: vi.fn(() => recognition.onend()),
    abort: vi.fn(),
  }
  vi.stubGlobal('SpeechRecognition', vi.fn(function () { return recognition }))
  return recognition
}

describe.each([
  ['DraxAgent', DraxAgent],
  ['DraxAgentExpress', DraxAgentExpress],
] as const)('%s props', (_, component) => {
  it('forwards explicit destination and manual selection policy, hiding attribution by default', async () => {
    const wrapper = mount(component, {props: {initialAgentIdentifier: 'calendar', allowManualSelection: false}, global})
    wrappers.push(wrapper)
    await flushPromises()
    expect(componentAgent(wrapper).selectedAgentIdentifier).toBe('calendar')
    expect(componentAgent(wrapper).showAgentSelector).toBe(false)
    expect(wrapper.text()).not.toContain('Atendido por')
    expect(wrapper.find('.chatbot-task__agent-select').exists()).toBe(false)
    expect(wrapper.find('.drax-agent-express__agent-list').exists()).toBe(false)
  })

  it('defaults manual selection to true and renders only public attribution when opted in', async () => {
    const recognition = installSpeechRecognition()
    const wrapper = mount(component, {props: {showResolvedAgent: true}, global})
    wrappers.push(wrapper)
    await flushPromises()
    const state = componentAgent(wrapper)
    expect(state.showAgentSelector).toBe(true)
    if (state.sendMessage) {
      state.input = 'Hola'
      await state.sendMessage()
    } else {
      const microphone = wrapper.get('.drax-agent-express__mic-button')
      await microphone.trigger('keydown', {key: 'Enter'})
      recognition.onresult({resultIndex: 0, results: [{isFinal: true, 0: {transcript: 'Hola'}}]})
      expect(mocks.sendMessage).not.toHaveBeenCalled()
      await microphone.trigger('keyup', {key: 'Enter'})
    }
    await flushPromises()
    expect(wrapper.text()).toContain('Atendido por Gestion de tareas')
    expect(wrapper.text()).not.toContain('private routing instructions')
    expect(wrapper.text()).not.toContain('private example')
  })

  it('disables destination-dependent controls while listing is pending', async () => {
    mocks.listAgents.mockReturnValue(deferred<IAgentListResponse>().promise)
    const wrapper = mount(component, {global})
    wrappers.push(wrapper)
    if (component === DraxAgentExpress) {
      expect(wrapper.get('.drax-agent-express__mic-button').attributes('disabled')).toBeDefined()
      expect(wrapper.text()).toContain('Cargando agentes')
    } else {
      expect(wrapper.get('button[aria-label="Enviar"]').attributes('disabled')).toBeDefined()
      expect(wrapper.findAll('button').find((item) => item.text() === 'CHAT')?.attributes('disabled')).toBeDefined()
    }
  })
})

describe.each([
  ['DraxAgent', DraxAgent],
  ['DraxAgentExpress', DraxAgentExpress],
] as const)('%s current-response silence', (_, component) => {
  it.each(['browser', 'provider'] as const)('stops only the current %s audio and allows the next response to speak', async (voice) => {
    const {synthesis, audio} = installTextToSpeech()
    const recognition = installSpeechRecognition()
    const wrapper = mount(component, {global})
    wrappers.push(wrapper)
    await flushPromises()
    const state = componentAgent(wrapper)
    state.selectTextToSpeechVoice(voice === 'browser' ? 'WebSpeechAPI' : 'voice-1')

    const sendFromComponent = async () => {
      if (state.sendMessage) {
        state.input = 'Hola'
        await state.sendMessage()
      } else {
        const microphone = wrapper.get('.drax-agent-express__mic-button')
        await microphone.trigger('keydown', {key: 'Enter'})
        recognition.onresult({resultIndex: 0, results: [{isFinal: true, 0: {transcript: 'Hola'}}]})
        await microphone.trigger('keyup', {key: 'Enter'})
      }
      await flushPromises()
      if (voice === 'browser') {
        const utterance = synthesis.speak.mock.lastCall![0] as {onstart: () => void}
        utterance.onstart()
        await flushPromises()
      }
    }

    await sendFromComponent()
    expect(state.textToSpeechSpeaking).toBe(true)
    expect(state.textToSpeechEnabled).toBe(true)
    const manager = wrapper.getComponent({name: 'VManagerBot'})
    expect(manager.props('silenceOnClick')).toBe(true)
    const preferences = {...window.localStorage}
    synthesis.cancel.mockClear()
    audio.pause.mockClear()

    manager.vm.$emit('silence')
    await flushPromises()
    expect(state.textToSpeechSpeaking).toBe(false)
    expect(state.textToSpeechEnabled).toBe(true)
    expect(manager.props('speaking')).toBe(false)
    expect({...window.localStorage}).toEqual(preferences)
    expect(synthesis.cancel).toHaveBeenCalledTimes(1)
    if (voice === 'provider') {
      expect(audio.pause).toHaveBeenCalledTimes(1)
      expect(audio.load).toHaveBeenCalled()
      expect(audio.src).toBe('')
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:synthesized')
    }

    await sendFromComponent()
    expect(state.textToSpeechSpeaking).toBe(true)
    expect(state.textToSpeechEnabled).toBe(true)
    expect(mocks.sendMessage).toHaveBeenCalledTimes(2)
    if (voice === 'browser') {
      expect(synthesis.speak).toHaveBeenCalledTimes(2)
    } else {
      expect(audio.play).toHaveBeenCalledTimes(2)
    }
  })
})

it('silences only the current response from the compact audio indicator', async () => {
  const {synthesis} = installTextToSpeech()
  const wrapper = mount(DraxAgent, {props: {compact: true}, global})
  wrappers.push(wrapper)
  await flushPromises()
  const state = componentAgent(wrapper)
  const speak = async () => {
    state.input = 'Hola'
    await state.sendMessage!()
    const utterance = synthesis.speak.mock.lastCall![0] as {onstart: () => void}
    utterance.onstart()
    await flushPromises()
  }
  await speak()
  const silence = wrapper.get('button[aria-label="Silenciar esta respuesta"]')
  expect(silence.attributes('type')).toBe('button')
  await silence.trigger('click')
  expect(state.textToSpeechEnabled).toBe(true)
  expect(state.textToSpeechSpeaking).toBe(false)
  expect(wrapper.find('button[aria-label="Silenciar esta respuesta"]').exists()).toBe(false)
  await speak()
  expect(state.textToSpeechSpeaking).toBe(true)
  expect(wrapper.find('button[aria-label="Silenciar esta respuesta"]').exists()).toBe(true)
})

it('supports opt-in attribution and blocked microphone in compact mode', async () => {
  mocks.listAgents.mockReturnValue(deferred<IAgentListResponse>().promise)
  const wrapper = mount(DraxAgent, {props: {compact: true, showResolvedAgent: true}, global})
  wrappers.push(wrapper)
  expect(wrapper.find('.chatbot-task--compact').exists()).toBe(true)
  expect(wrapper.text()).toContain('Cargando agentes')
  expect(wrapper.find('form').exists()).toBe(false)
})
