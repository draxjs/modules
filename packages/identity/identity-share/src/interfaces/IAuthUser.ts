interface IAuthUser {
    id: string
    username: string;
    roleId: string
    roleName?: string
    tenantId?: string
    tenantName?: string
    apiKeyId?: string
    apiKeyName?: string
    session?: string
    exp?: number
}

export {IAuthUser}
