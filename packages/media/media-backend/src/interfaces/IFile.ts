interface IFileBase {
    filename: string
    relativePath: string
    absolutePath: string
    url: string
    description?: string
    tags?: Array<string>
    mimetype: string
    encoding: string
    extension: string
    size: number
    type: string
    lastAccess: Date
    createdBy?: {
        id?: string
        username?: string
    }
    updatedBy?: {
        id?: string
        username?: string
    }
    createdFor?: string
    ttlSeconds: number
    expiresAt?: Date
    isPublic?: boolean
    hits?: number
    createdAt?: Date
    updatedAt?: Date
    tenant?: any
}

interface IFile {
    _id: string
    filename: string
    relativePath: string
    absolutePath: string
    url: string
    description?: string
    tags?: Array<string>
    mimetype: string
    encoding: string
    extension: string
    size: number
    type: string
    lastAccess: Date
    createdBy?: {
        id?: string
        username?: string
    }
    updatedBy?: {
        id?: string
        username?: string
    }
    createdFor?: string
    ttlSeconds: number
    expiresAt?: Date
    isPublic?: boolean
    hits?: number
    createdAt?: Date
    updatedAt?: Date
    tenant?: any
}

export type {
    IFileBase,
    IFile
}
