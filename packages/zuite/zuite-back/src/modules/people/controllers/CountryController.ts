
import CountryServiceFactory from "../factory/services/CountryServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import type {CustomRequest} from "@drax/crud-back";
import CountryPermissions from "../permissions/CountryPermissions.js";
import type {ICountry, ICountryBase} from "../interfaces/ICountry";
import type {FastifyReply} from "fastify";
import {join} from "path";
import {IDraxExportResult} from "@drax/crud-share";

class CountryController extends AbstractFastifyController<ICountry, ICountryBase, ICountryBase>   {

    constructor() {
        super(CountryServiceFactory.instance, CountryPermissions)
        this.tenantField = "company";
        this.userField = "createdBy";

        this.tenantFilter = false;
        this.tenantAssert = false;
        this.tenantSetter = false;

        this.userFilter = false;
        this.userSetter = false;
        this.userAssert = false;

    }

}

export default CountryController;
export {
    CountryController
}

