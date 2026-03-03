
import CountryServiceFactory from "../factory/services/CountryServiceFactory.js";
import {AbstractFastifyController, CustomRequest} from "@drax/crud-back";
import CountryPermissions from "../permissions/CountryPermissions.js";
import type {ICountry, ICountryBase} from "../interfaces/ICountry";
import {BadRequestError} from "@drax/common-back";
import type {FastifyReply} from "fastify";
import type {IDraxPaginateResult} from "@drax/crud-share/dist";

class CountryController extends AbstractFastifyController<ICountry, ICountryBase, ICountryBase>   {

    constructor() {
        super(CountryServiceFactory.instance, CountryPermissions)
        this.tenantField = "tenant";
        this.userField = "createdBy";

        this.tenantFilter = true;
        this.tenantSetter = true;
        this.tenantAssert = true;

        this.userFilter = true;
        this.userSetter = true;
        this.userAssert = true;
    }

    // async paginate(request: CustomRequest, reply: FastifyReply){
    //     if(true){
    //         throw new BadRequestError("Sarasa",'error.custom')
    //
    //     }
    //     return {} as Promise<IDraxPaginateResult<ICountry>>
    // }

}

export default CountryController;
export {
    CountryController
}

