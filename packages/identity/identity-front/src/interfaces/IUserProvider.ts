import type {IUser, IUserCreate, IUserUpdate} from "./IUser";
import type {IPaginateClient} from "@drax/common-front";



interface IUserProvider {
    paginateUser(page: number, limit: number, search?:string): Promise<IPaginateClient>
    createUser(input: IUserCreate): Promise<IUser>
    editUser(id: string, input: IUserUpdate): Promise<IUser>
    deleteUser(id: string): Promise<any>
    changeUserPassword(id: string, newPassword: string): Promise<boolean>
}

export type {IUserProvider}
