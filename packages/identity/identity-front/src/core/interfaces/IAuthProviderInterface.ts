interface IAuthProviderInterface{
    login(username: string, password: string): Promise<object>
}

export type {IAuthProviderInterface}
