import type {ITenantBase, ITenant} from "@drax/identity-share"
import TenantServiceFactory from "../factory/TenantServiceFactory.js"

async function CreateTenantIfNotExist(tenantData: ITenantBase):Promise<ITenant> {
    const tenantService = TenantServiceFactory()
    const tenant = await tenantService.findByName(tenantData.name)

    if(!tenant){
        const r = await tenantService.create(tenantData)
        console.log("Tenant Created. Name: "+ tenantData.name)
        return r
    }
}

export default CreateTenantIfNotExist
export {
    CreateTenantIfNotExist
}
