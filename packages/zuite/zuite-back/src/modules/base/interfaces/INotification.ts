
interface INotificationBase {
    title: string
    message: string
    type: string
    status: string | 'read' | 'unread'
    user: any
    metadata?: Record<string, any>
    readAt?: Date
    createdAt?: Date
    updatedAt?: Date
}

interface INotification {
    _id: string
    title: string
    message: string
    type: string
    status: string | 'read' | 'unread'
    user: any
    metadata?: Record<string, any>
    readAt?: Date
    createdAt?: Date
    updatedAt?: Date
}

export type {
INotificationBase, 
INotification
}
