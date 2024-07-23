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
            console.error("Error creating tenant", e)
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
            console.error("Error updating tenant", e)
            if (e instanceof ZodError) {
                throw ZodErrorToValidationError(e, tenantData)
            }
            throw e
        }
    }

    async delete(id: string): Promise<boolean> {
        try {
            const deletedTenant = await this._repository.delete(id);
            return deletedTenant;
        } catch (e) {
            console.error("Error deleting tenant", e)
            throw e;
        }

    }

    async findById(id: string): Promise<ITenant | null> {
        try {
            const tenant: ITenant = await this._repository.findById(id);
            return tenant
        } catch (e) {
            console.error("Error finding tenant by id", e)
            throw e;
        }

    }

    async findByName(name: string): Promise<ITenant | null> {
        try {
            const tenant: ITenant = await this._repository.findByName(name);
            return tenant
        } catch (e) {
            console.error("Error finding tenant by name", e)
            throw e;
        }

    }

    async fetchAll(): Promise<ITenant[]> {
        try {
            const tenants: ITenant[] = await this._repository.fetchAll();
            return tenants
        } catch (e) {
            console.error("Error fetching all tenants", e)
            throw e;
        }

    }

    async paginate({
                       page = 1,
                       limit = 5,
                       orderBy = '',
                       orderDesc = false,
                       search = '',
                       filters = []
                   }: IDraxPaginateOptions): Promise<IDraxPaginateResult<ITenant>> {
        try {
            const pagination = await this._repository.paginate({page, limit, orderBy, orderDesc, search, filters});
            return pagination;
        } catch (e) {
            console.error("Error paginating tenants", e)
            throw e;
        }

    }


}

export default TenantService
