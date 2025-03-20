import {IRoleRepository} from "../interfaces/IRoleRepository";
import {UnauthorizedError, ValidationError, ZodErrorToValidationError} from "@drax/common-back"
import { AbstractService } from "@drax/crud-back"
import {RoleBaseSchema} from "../schemas/RoleSchema.js";
import {ZodError} from "zod";
import {IDraxPaginateOptions, IDraxPaginateResult} from "@drax/crud-share";
import type {IRoleBase, IRole} from "@drax/identity-share";

class RoleService extends AbstractService<IRole, IRoleBase, IRoleBase> {

    _repository: IRoleRepository

    constructor(roleRepostitory: IRoleRepository) {
        super(roleRepostitory, RoleBaseSchema)
        this._repository = roleRepostitory
        console.log("RoleService constructor")
    }

    async create(roleData: IRoleBase): Promise<IRole> {
        try {
            roleData.name = roleData?.name?.trim()
            await RoleBaseSchema.parseAsync(roleData)
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

    async update(id: string, roleData: IRoleBase): Promise<IRole> {
        try {
            roleData.name = roleData?.name?.trim()
            await RoleBaseSchema.parseAsync(roleData)
            const currentRole = await this.findById(id)
            if(currentRole.readonly){
                throw new ValidationError([{field:'name', reason:"role.readonly", value:roleData.name}])
            }
            const role: IRole = await this._repository.update(id, roleData)
            return role
        } catch (e) {
            console.error("Error updating role", e)
            if (e instanceof ZodError) {
                throw ZodErrorToValidationError(e, roleData)
            }
            throw e
        }
    }

    async systemUpdate(id: string, roleData: IRoleBase): Promise<IRole> {
        try {
            roleData.name = roleData?.name?.trim()
            await RoleBaseSchema.parseAsync(roleData)
            const role: IRole = await this._repository.update(id, roleData)
            return role
        } catch (e) {
            console.error("Error systemUpdating role", e)
            if (e instanceof ZodError) {
                throw ZodErrorToValidationError(e, roleData)
            }
            throw e
        }
    }

    async delete(id: string): Promise<boolean> {
        try {
            const currentRole = await this.findById(id)
            if(currentRole.readonly){
                throw new UnauthorizedError()
            }
            const deletedRole = await this._repository.delete(id);
            return deletedRole;
        } catch (e) {
            console.error("Error deleting role", e)
            throw e
        }
    }

    async systemDelete(id: string): Promise<boolean> {
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

    async search(value: any, limit=1000, filters=[]): Promise<IRole[]> {
        const roles: IRole[] = await this._repository.search(value, limit, filters);
        return roles;
    }

    async paginate({
                       page = 1,
                       limit = 5,
                       orderBy = '',
                       order = "asc",
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
