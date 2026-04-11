
interface IAILogBase {
    provider?: string
    model?: string
    operationTitle?: string
    operationGroup?: string
    ip?: string
    userAgent?: string
    input?: string
    inputImages?: Array<{
    filename?: string
    filepath?: string
    size?: number
    mimetype?: string
    url?: string
    }>
    inputFiles?: Array<{
    filename?: string
    filepath?: string
    size?: number
    mimetype?: string
    url?: string
    }>
    inputTokens?: number
    outputTokens?: number
    tokens?: number
    startedAt?: Date
    endedAt?: Date
    responseTime?: string
    output?: string
    success?: boolean
    statusCode?: number
    errorMessage?: string
    tenant?: any
    user?: any
    createdAt?: Date
    updatedAt?: Date
}

interface IAILog {
    _id: string
    provider?: string
    model?: string
    operationTitle?: string
    operationGroup?: string
    ip?: string
    userAgent?: string
    input?: string
    inputImages?: Array<{
    filename?: string
    filepath?: string
    size?: number
    mimetype?: string
    url?: string
    }>
    inputFiles?: Array<{
    filename?: string
    filepath?: string
    size?: number
    mimetype?: string
    url?: string
    }>
    inputTokens?: number
    outputTokens?: number
    tokens?: number
    startedAt?: Date
    endedAt?: Date
    responseTime?: string
    output?: string
    success?: boolean
    statusCode?: number
    errorMessage?: string
    tenant?: any
    user?: any
    createdAt?: Date
    updatedAt?: Date
}

export type {
IAILogBase, 
IAILog
}
