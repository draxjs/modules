import {IRole} from "../interfaces/IRole";
import {IRoleRepository} from "../interfaces/IRoleRepository";
import {IPaginateFilter, IPaginateResult} from "@drax/common-back"

class RoleService {

    _repository: IRoleRepository

    constructor(roleRepostitory: IRoleRepository) {
        this._repository = roleRepostitory
    }

    async create(roleData: IRole): Promise<IRole> {
        const role = await this._repository.create(roleData)
        return role
    }

    async update(id: any, roleData: IRole) {
        const role = await this._repository.update(id, roleData)
        return role
    }

    async delete(id: any): Promise<boolean> {
        const deletedRole = await this._repository.delete(id);
        return deletedRole;
    }

    async findById(id: any): Promise<IRole | null> {
        const role : IRole =  await this._repository.findById(id);
        return role
    }

    async paginate( page: number = 1, limit: number = 1, filters ?: IPaginateFilter[]): Promise<IPaginateResult> {
        const pagination = await this._repository.paginate(page, limit, filters);
        return pagination;
    }


}

export default RoleService
