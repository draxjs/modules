interface IDraxCrudEvent<T = any> {
    entity: string;
    resourceId?: string;
    action: 'created' | 'updated' | 'deleted' | 'exported' | string;
    preItem?: T;
    postItem?: T;
    user: {
        id: string;
        username: string;
        role: {
            id: string;
            name?: string;
        }
        tenant?: {
            id?: string;
            name?: string;
        }
        apiKey?: {
            id?: string;
            name?: string;
        }
        session?: string;
    }
    ip?: string;
    userAgent?: string;
    requestId?: string;
    timestamp: Date;
    detail?: string;
}


export type {IDraxCrudEvent}
