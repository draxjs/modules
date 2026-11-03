import {beforeEach, describe, expect, it, vi} from 'vitest'
import AgentProvider, {type IAgentListResponse, type IChatbotTaskMessageResponse} from '../../ai-front/src/providers/AgentProvider'

const http = vi.hoisted(() => ({get: vi.fn(), post: vi.fn()}))
vi.mock('@drax/common-front', () => ({HttpRestClientFactory: {getInstance: () => http}}))

beforeEach(() => {
  http.get.mockReset()
  http.post.mockReset()
})

describe('AgentProvider compatibility', () => {
  it('preserves optional routing metadata without changing the listing endpoint', async () => {
    const listing: IAgentListResponse = {
      agents: [{identifier: 'auto', description: 'Asistente', type: 'router', routing: {
        eligible: false, recommended: true, capabilities: 'Selecciona especialistas', examples: ['Una tarea'],
      }}],
      recommendedAgentIdentifier: 'auto',
    }
    http.get.mockResolvedValue(listing)
    expect(await new AgentProvider().listAgents()).toBe(listing)
    expect(http.get).toHaveBeenCalledWith('/api/ai/agent', {timeout: 120000})
  })

  it('preserves all turn metadata and existing request fields, including audio', async () => {
    const response: IChatbotTaskMessageResponse = {
      agentIdentifier: 'auto', sessionId: 'session-1', message: 'Respuesta', navigationPath: '/tasks',
      resolvedAgentIdentifier: 'tasks', correlationId: 'turn-1',
      error: {code: 'SAVE_FAILED', stage: 'persist', message: 'Error al guardar', operationMayHaveCompleted: true},
      metrics: {tokens: 12, breakdown: {router: {tokens: 2}, specialist: {tokens: 10}}},
      audio: {audio: 'YQ==', contentType: 'audio/mpeg', encoding: 'base64', meta: {
        provider: 'ElevenLabs', model: 'model', voiceId: 'voice', size: 1, time: 2,
      }},
    }
    http.post.mockResolvedValue(response)
    const audio = {provider: 'ElevenLabs', voiceId: 'voice'}
    expect(await new AgentProvider().sendMessage('Hola', 'session-1', 'auto', audio)).toBe(response)
    expect(http.post).toHaveBeenCalledWith('/api/ai/agent/message', {
      message: 'Hola', sessionId: 'session-1', identifier: 'auto', audioResponse: audio,
    }, {timeout: 360000})
  })

  it('still supports legacy listing, message and session responses', async () => {
    const provider = new AgentProvider()
    http.get.mockResolvedValue({agents: [{identifier: 'default', description: ''}]})
    http.post.mockResolvedValueOnce({sessionId: 'old-session'})
    expect(await provider.listAgents()).toEqual({agents: [{identifier: 'default', description: ''}]})
    expect(await provider.startSession('default')).toEqual({sessionId: 'old-session'})
    expect(http.post).toHaveBeenLastCalledWith('/api/ai/agent/session', {identifier: 'default'}, {timeout: 120000})
    http.post.mockResolvedValueOnce({sessionId: 'old-session', message: 'Hola'})
    expect(await provider.sendMessage('Hola', 'old-session', 'default')).toEqual({sessionId: 'old-session', message: 'Hola'})
    expect(http.post).toHaveBeenLastCalledWith('/api/ai/agent/message', {
      message: 'Hola', sessionId: 'old-session', identifier: 'default',
    }, {timeout: 360000})
  })

  it('does not swallow rejected backend feature payloads', async () => {
    const failure = {body: {error: {code: 'ROUTING_FAILED', stage: 'route', message: 'Sin destino'}}}
    http.post.mockRejectedValue(failure)
    await expect(new AgentProvider().sendMessage('Hola', undefined, 'auto')).rejects.toBe(failure)
  })
})
