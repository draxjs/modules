interface IAuthProviderInterface{
    login(username: string, password: string): Promise<string>
}

export {IAuthProviderInterface}
