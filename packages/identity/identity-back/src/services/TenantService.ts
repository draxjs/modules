import {ITenantRepository} from "../interfaces/ITenantRepository";
import {ValidationError, ZodErrorToValidationError} from "@drax/common-back"
import {tenantSchema} from "../zod/TenantZod.js";
import {ZodError} from "zod";
import {ITenantBase, ITenant} from "@drax/identity-share";
import {IDraxPaginateOptions, IDraxPaginateResult} from "@drax/common-share";

class TenantService {

    _repository: ITenantRepository

    constructor(tenantRepostitory: ITenantRepository) {
        this._repository = tenantRepostitory
        console.log("TenantService constructor")
    }

    async create(tenantData: ITenantBase): Promise<ITenant> {
        try {
            tenantData.name = tenantData?.name?.trim()
            await tenantSchema.parseAsync(tenantData)
            const tenant = await this._repository.create(tenantData)
            return tenant
        } catch (e) {
            if (e instanceof ZodError) {
                throw ZodErrorToValidationError(e, tenantData)
            }
            throw e
        }
    }

    async update(id: string, tenantData: ITenantBase) {
        try {
            tenantData.name = tenantData?.name?.trim()
            await tenantSchema.parseAsync(tenantData)
            const tenant = await this._repository.update(id, tenantData)
            return tenant
        } catch (e) {
            if (e instanceof ZodError) {
                throw ZodErrorToValidationError(e, tenantData)
            }
            throw e
        }
    }

    async delete(id: string): Promise<boolean> {
        const currentTenant = await this.findById(id)
        const deletedTenant = await this._repository.delete(id);
        return deletedTenant;
    }

    async findById(id: string): Promise<ITenant | null> {
        const tenant: ITenant = await this._repository.findById(id);
        return tenant
    }

    async findByName(name: string): Promise<ITenant | null> {
        const tenant: ITenant = await this._repository.findByName(name);
        return tenant
    }

    async fetchAll(): Promise<ITenant[]> {
        const tenants: ITenant[] = await this._repository.fetchAll();
        return tenants
    }

    async paginate({
                       page= 1,
                       limit= 5,
                       orderBy= '',
                       orderDesc= false,
                       search= '',
                       filters= []} : IDraxPaginateOptions): Promise<IDraxPaginateResult<ITenant>>{
        const pagination = await this._repository.paginate({page, limit, orderBy, orderDesc, search, filters});
        return pagination;
    }


}

export default TenantService
