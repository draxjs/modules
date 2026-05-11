import {HttpRestClientFactory, IHttpClient} from "@drax/common-front";

interface IChatbotTaskSessionResponse {
  sessionId: string
}

interface IChatbotTaskMessageResponse {
  sessionId: string
  message: string
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

  async startSession(): Promise<IChatbotTaskSessionResponse> {
    return await this.httpClient.post(`${this.basePath}/session`, {}, {timeout: 120000}) as IChatbotTaskSessionResponse
  }

  async sendMessage(message: string, sessionId?: string): Promise<IChatbotTaskMessageResponse> {
    return await this.httpClient.post(`${this.basePath}/message`, {message, sessionId}, {timeout: 120000}) as IChatbotTaskMessageResponse
  }
}

export type {IChatbotTaskMessageResponse, IChatbotTaskSessionResponse}
export default ChatbotTaskProvider
