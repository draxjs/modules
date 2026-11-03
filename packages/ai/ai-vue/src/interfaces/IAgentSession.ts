import type {IAIInputFile, IAIPromptContentPart} from '@drax/ai-share';

type IAgentSessionConversationType = 'specialist' | 'router'

interface IAgentSessionMessage {
    role: string
    content: string
    createdAt?: Date
    resolvedAgentIdentifier?: string
    correlationId?: string
    userContent?: IAIPromptContentPart[]
    inputFiles?: IAIInputFile[]
}

interface IAgentSessionBase {
    sessionId: string
    ownerAgentIdentifier?: string
    conversationType?: IAgentSessionConversationType
    lastResolvedAgentIdentifier?: string
    title?: string
    lastMessageAt?: Date
    messages?: IAgentSessionMessage[]
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
    ownerAgentIdentifier?: string
    conversationType?: IAgentSessionConversationType
    lastResolvedAgentIdentifier?: string
    title?: string
    lastMessageAt?: Date
    messages?: IAgentSessionMessage[]
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
IAgentSession,
IAgentSessionConversationType,
IAgentSessionMessage
}
