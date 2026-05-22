import {HttpRestClientFactory} from "@drax/common-front";
import type {IHttpClient} from "@drax/common-front";
import type {IAIPromptAudioParams, IAIPromptAudioResponse} from "@drax/ai-share";

interface IChatbotTaskSessionResponse {
  agentIdentifier?: string
  sessionId: string
}

interface IChatbotTaskMessageResponse {
  agentIdentifier?: string
  sessionId: string
  message: string
  navigationPath?: string | null
  audio?: IAIPromptAudioResponse
}

interface IAgentOption {
  identifier: string
  description: string
}

interface IAgentListResponse {
  agents: IAgentOption[]
}

class ChatbotTaskProvider {
  static singleton: ChatbotTaskProvider

  httpClient: IHttpClient
  basePath: string = '/api/ai/agent'

  constructor() {
    this.httpClient = HttpRestClientFactory.getInstance()
  }

  static get instance() {
    if (!ChatbotTaskProvider.singleton) {
      ChatbotTaskProvider.singleton = new ChatbotTaskProvider()
    }

    return ChatbotTaskProvider.singleton
  }

  async listAgents(): Promise<IAgentListResponse> {
    return await this.httpClient.get(this.basePath, {timeout: 120000}) as IAgentListResponse
  }

  async startSession(identifier?: string): Promise<IChatbotTaskSessionResponse> {
    return await this.httpClient.post(`${this.basePath}/session`, {identifier}, {timeout: 120000}) as IChatbotTaskSessionResponse
  }

  async sendMessage(
    message: string,
    sessionId?: string,
    identifier?: string,
    audioResponse?: boolean | IAIPromptAudioParams,
  ): Promise<IChatbotTaskMessageResponse> {
    return await this.httpClient.post(
      `${this.basePath}/message`,
      {message, sessionId, identifier, ...(audioResponse ? {audioResponse} : {})},
      {timeout: 360000},
    ) as IChatbotTaskMessageResponse
  }
}

export type {IAgentListResponse, IAgentOption, IChatbotTaskMessageResponse, IChatbotTaskSessionResponse}
export default ChatbotTaskProvider
