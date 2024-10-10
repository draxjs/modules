import type {IUserProvider} from "../interfaces/IUserProvider";
import type {IUser, IUserCreate, IUserUpdate} from "@drax/identity-share";
import type { IDraxPaginateOptions, IDraxPaginateResult} from "@drax/crud-share";


class UserSystem implements IUserProvider{

    _provider: IUserProvider
    prototype: string;

    constructor(provider: IUserProvider) {
        this._provider = provider;
        this.prototype = 'UserSystem'
    }

    async search(value: any):Promise<IUser[]> {

        if(!this._provider.search){
            throw new Error("Search method not implemented")
        }

        return this._provider.search(value)
    }

    async paginate({page= 1, limit= 5, orderBy="", order=false, search = "", filters = []}: IDraxPaginateOptions):Promise<IDraxPaginateResult<IUser>> {
        return this._provider.paginate({page, limit, orderBy, order, search, filters})
    }

    async create(userPayload: IUserCreate):Promise<IUser> {
        return this._provider.create(userPayload)
    }

    async update(id:string, userPayload: IUserUpdate):Promise<IUser> {
        return this._provider.update(id, userPayload)
    }

    async delete(id: string):Promise<any> {
        return this._provider.delete(id)
    }

    async changeUserPassword(userId:string, newPassword:string):Promise<boolean> {
        console.log("UserSystem",userId, newPassword)
        const result: boolean = await this._provider.changeUserPassword(userId,newPassword)
        return result
    }





}

export default UserSystem
export {UserSystem}
