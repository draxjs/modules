interface IAuditBase {
    entity: string
    user: {
        id: string
        username: string
        rolName: string
    }
    action: string
    ip: string
    userAgent: string
    changes?: Array<{
        field: string
        old?: string
        new?: string
    }>
    sessionId?: string
    requestId?: string
    detail?: string
    tenant?: {
        id: string
        name: string
    }
    createdAt?: Date
    updatedAt?: Date
}

interface IAudit {
    _id: string
    entity: string
    user: {
        id: string
        username: string
        rolName: string
    }
    action: string
    ip: string
    userAgent: string
    changes?: Array<{
        field: string
        old?: string
        new?: string
    }>
    sessionId?: string
    requestId?: string
    detail?: string
    tenant?: {
        id: string
        name: string
    }
    createdAt?: Date
    updatedAt?: Date
}

export type {
    IAuditBase,
    IAudit
}
