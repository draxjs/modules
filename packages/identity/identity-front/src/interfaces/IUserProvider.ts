import type {IUser} from "@/interfaces/IUser";



interface IUserProvider {
    paginateUser(page: number, limit: number): Promise<any>
    createUser(input: IUser): Promise<any>
}

export type {IUserProvider}
