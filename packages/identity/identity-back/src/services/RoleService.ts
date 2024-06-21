import {IRole} from "../interfaces/IRole";
import {IRoleRepository} from "../interfaces/IRoleRepository";
import {IPaginateFilter, IPaginateResult, ValidationError, ZodErrorToValidationError} from "@drax/common-back"
import {roleSchema} from "../zod/RoleZod.js";
import {ZodError} from "zod";
import UnauthorizedError from "../errors/UnauthorizedError.js";

class RoleService {

    _repository: IRoleRepository

    constructor(roleRepostitory: IRoleRepository) {
        this._repository = roleRepostitory
        console.log("RoleService constructor")
    }

    async create(roleData: IRole): Promise<IRole> {
        try {
            roleData.name = roleData?.name?.trim()
            await roleSchema.parseAsync(roleData)
            const role = await this._repository.create(roleData)
            return role
        } catch (e) {
            if (e instanceof ZodError) {
                throw ZodErrorToValidationError(e, roleData)
            }
            throw e
        }
    }

    async update(id: any, roleData: IRole) {
        try {
            roleData.name = roleData?.name?.trim()
            await roleSchema.parseAsync(roleData)
            const currentRole = await this.findById(id)
            if(currentRole.readonly){
                throw new ValidationError([{field:'name', reason:"role.readonly", value:roleData.name}])
            }
            const role = await this._repository.update(id, roleData)
            return role
        } catch (e) {
            if (e instanceof ZodError) {
                throw ZodErrorToValidationError(e, roleData)
            }
            throw e
        }
    }

    async delete(id: any): Promise<boolean> {
        const currentRole = await this.findById(id)
        if(currentRole.readonly){
            throw new UnauthorizedError()
        }
        const deletedRole = await this._repository.delete(id);
        return deletedRole;
    }

    async findById(id: any): Promise<IRole | null> {
        const role: IRole = await this._repository.findById(id);
        return role
    }

    async fetchAll(): Promise<IRole[]> {
        const roles: IRole[] = await this._repository.fetchAll();
        return roles
    }

    async paginate(page: number = 1, limit: number = 5, search?:string, filters ?: IPaginateFilter[]): Promise<IPaginateResult> {
        const pagination = await this._repository.paginate(page, limit, search, filters);
        return pagination;
    }


}

export default RoleService
