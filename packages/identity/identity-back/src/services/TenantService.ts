import {ITenant} from "../interfaces/ITenant";
import {ITenantRepository} from "../interfaces/ITenantRepository";
import {IPaginateFilter, IPaginateResult, ValidationError, ZodErrorToValidationError} from "@drax/common-back"
import {tenantSchema} from "../zod/TenantZod.js";
import {ZodError} from "zod";
import UnauthorizedError from "../errors/UnauthorizedError.js";

class TenantService {

    _repository: ITenantRepository

    constructor(tenantRepostitory: ITenantRepository) {
        this._repository = tenantRepostitory
        console.log("TenantService constructor")
    }

    async create(tenantData: ITenant): Promise<ITenant> {
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

    async update(id: any, tenantData: ITenant) {
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

    async delete(id: any): Promise<boolean> {
        const currentTenant = await this.findById(id)
        const deletedTenant = await this._repository.delete(id);
        return deletedTenant;
    }

    async findById(id: any): Promise<ITenant | null> {
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

    async paginate(page: number = 1, limit: number = 5, search?:string, filters ?: IPaginateFilter[]): Promise<IPaginateResult> {
        const pagination = await this._repository.paginate(page, limit, search, filters);
        return pagination;
    }


}

export default TenantService
