import {IRoleRepository} from "../interfaces/IRoleRepository";
import { ValidationError, ZodErrorToValidationError} from "@drax/common-back"
import {roleSchema} from "../zod/RoleZod.js";
import {ZodError} from "zod";
import UnauthorizedError from "../errors/UnauthorizedError.js";
import {IDraxPaginateOptions, IDraxPaginateResult} from "@drax/common-share";
import {IRoleBase, IRole} from "@drax/identity-share";

class RoleService {

    _repository: IRoleRepository

    constructor(roleRepostitory: IRoleRepository) {
        this._repository = roleRepostitory
        console.log("RoleService constructor")
    }

    async create(roleData: IRoleBase): Promise<IRole> {
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

    async update(id: string, roleData: IRoleBase) {
        try {
            roleData.name = roleData?.name?.trim()
            await roleSchema.parseAsync(roleData)
            const role = await this._repository.update(id, roleData)
            return role
        } catch (e) {
            if (e instanceof ZodError) {
                throw ZodErrorToValidationError(e, roleData)
            }
            throw e
        }
    }

    async delete(id: string): Promise<boolean> {

        const deletedRole = await this._repository.delete(id);
        return deletedRole;
    }

    async findById(id: string): Promise<IRole | null> {
        const role: IRole = await this._repository.findById(id);
        return role
    }

    async findByName(name: string): Promise<IRole | null> {
        const role: IRole = await this._repository.findByName(name);
        return role
    }

    async fetchAll(): Promise<IRole[]> {
        const roles: IRole[] = await this._repository.fetchAll();
        return roles
    }

    async paginate({
                       page= 1,
                       limit= 5,
                       orderBy= '',
                       orderDesc= false,
                       search= '',
                       filters= []} : IDraxPaginateOptions): Promise<IDraxPaginateResult<IRole>>{
        const pagination = await this._repository.paginate({page, limit, orderBy, orderDesc, search, filters});
        return pagination;
    }


}

export default RoleService
