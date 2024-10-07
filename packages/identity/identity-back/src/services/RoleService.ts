import {IRoleRepository} from "../interfaces/IRoleRepository";
import { ZodErrorToValidationError} from "@drax/common-back"
import {roleSchema} from "../zod/RoleZod.js";
import {ZodError} from "zod";
import {IDraxPaginateOptions, IDraxPaginateResult} from "@drax/crud-share";
import type {IRoleBase, IRole} from "@drax/identity-share";

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
            console.error("Error creating role", e)
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
            console.error("Error updating role", e)
            if (e instanceof ZodError) {
                throw ZodErrorToValidationError(e, roleData)
            }
            throw e
        }
    }

    async delete(id: string): Promise<boolean> {
        try {
            const deletedRole = await this._repository.delete(id);
            return deletedRole;
        } catch (e) {
            console.error("Error deleting role", e)
            throw e
        }
    }

    async findById(id: string): Promise<IRole | null> {
        try{
            const role: IRole = await this._repository.findById(id);
            return role
        }catch (e){
            console.error("Error finding role by id", e)
            throw e;
        }

    }

    async findByName(name: string): Promise<IRole | null> {
        try{
            const role: IRole = await this._repository.findByName(name);
            return role
        }catch (e){
            console.error("Error finding role by name", e)
            throw e;
        }

    }

    async fetchAll(): Promise<IRole[]> {
        const roles: IRole[] = await this._repository.fetchAll();
        return roles
    }

    async paginate({
                       page = 1,
                       limit = 5,
                       orderBy = '',
                       order = false,
                       search = '',
                       filters = []
                   }: IDraxPaginateOptions): Promise<IDraxPaginateResult<IRole>> {
        try{
            const pagination = await this._repository.paginate({page, limit, orderBy, order, search, filters});
            return pagination;
        }catch (e){
            console.error("Error paginating roles", e)
            throw e;
        }

    }


}

export default RoleService
