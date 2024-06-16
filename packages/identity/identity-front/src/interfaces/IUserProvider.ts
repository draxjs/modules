interface IUserCreate{
    username: string
    email: string
    password: string
    role: string
}

interface IUserProvider {
    paginateUser(page: number, limit: number): Promise<any>
    createUser(input: IUserCreate): Promise<any>
}

export type {IUserProvider, IUserCreate}
