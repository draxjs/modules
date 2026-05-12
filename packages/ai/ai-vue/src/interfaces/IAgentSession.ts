
interface IAgentSessionBase {
    sessionId: string
    title?: string
    lastMessageAt?: Date
    messages?: Array<{
    role: string
    content: string
    createdAt?: Date
    }>
    messageCount?: number
    inputTokens?: number
    outputTokens?: number
    tokens?: number
    tenant?: any
    user?: any
    createdAt?: Date
    updatedAt?: Date
}

interface IAgentSession {
    _id: string
    sessionId: string
    title?: string
    lastMessageAt?: Date
    messages?: Array<{
    role: string
    content: string
    createdAt?: Date
    }>
    messageCount?: number
    inputTokens?: number
    outputTokens?: number
    tokens?: number
    tenant?: any
    user?: any
    createdAt?: Date
    updatedAt?: Date
}

export type {
IAgentSessionBase, 
IAgentSession
}
