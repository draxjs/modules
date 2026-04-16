import { HttpRestClientFactory, IHttpClient } from "@drax/common-front";

type AiTestPromptPayload = {
  systemPrompt: string
  userInput?: string
  inputFiles?: Array<{
    filename?: string
    filepath?: string
    size?: number | string | null
    mimetype?: string
    url?: string
  }>
  history?: Array<{
    role: "user" | "assistant" | "system"
    content: string | Array<{
      type: "text" | "image"
      text?: string
      imageUrl?: string
      detail?: "auto" | "low" | "high"
    }>
  }>
  memory?: Array<{
    key: string
    value: string
  }>
  knowledgeBase?: string[]
  knowledgeBaseHeader?: string
  memoryHeader?: string
  userImages?: Array<{
    url: string
    detail?: "auto" | "low" | "high"
  }>
  userContent?: Array<{
    type: "text" | "image"
    text?: string
    imageUrl?: string
    detail?: "auto" | "low" | "high"
  }>
  jsonSchema?: object
  visionImageMode?: "url" | "base64"
  visionDetail?: "auto" | "low" | "high"
  model?: string
  operationTitle?: string
  operationGroup?: string
}

type AiTestPromptResponse = {
  output: unknown
  tokens: number
  inputTokens: number
  outputTokens: number
  time: number
}

class AiTestProvider {

  static singleton: AiTestProvider

  httpClient: IHttpClient
  basePath = "/api/ai-test"

  constructor() {
    this.httpClient = HttpRestClientFactory.getInstance()
  }

  static get instance() {
    if (!AiTestProvider.singleton) {
      AiTestProvider.singleton = new AiTestProvider()
    }
    return AiTestProvider.singleton
  }

  async prompt(payload: AiTestPromptPayload): Promise<AiTestPromptResponse> {
    return await this.httpClient.post(`${this.basePath}/prompt`, payload, { timeout: 120000 }) as AiTestPromptResponse
  }

}

export default AiTestProvider
export type {
  AiTestPromptPayload,
  AiTestPromptResponse,
}
