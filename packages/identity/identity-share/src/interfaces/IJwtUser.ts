interface IJwtUser {
    id: string
    username: string;
    roleId: string
    tenantId?: string
    session?: string
    exp?: number
}

export {IJwtUser}
