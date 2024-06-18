import type {IUser, IUserCreate, IUserUpdate} from "@/interfaces/IUser";
import type {IPaginateClient} from "@drax/common-front";



interface IUserProvider {
    paginateUser(page: number, limit: number): Promise<IPaginateClient>
    createUser(input: IUserCreate): Promise<IUser>
    editUser(id: string, input: IUserUpdate): Promise<IUser>
    deleteUser(id: string): Promise<any>
}

export type {IUserProvider}
