interface IJwtUser {
    id: string
    username: string;
    roleId: string
    tenantId?: string
    session?: string
}

export {IJwtUser}
