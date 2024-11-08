
import CountryServiceFactory from "../factory/services/CountryServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import CountryPermissions from "../permissions/CountryPermissions.js";
import type {ICountry, ICountryBase} from "../interfaces/ICountry";

class CountryController extends AbstractFastifyController<ICountry, ICountryBase, ICountryBase>   {

    constructor() {
        super(CountryServiceFactory.instance, CountryPermissions)
        this.tenantField = "tenant";
        this.userField = "user";
        this.tenantFilter = false;
        this.userFilter = false;
        this.tenantSetter = false;
        this.userSetter = false;
        this.tenantAssert = false;
        this.userAssert = false;
    }

}

export default CountryController;
export {
    CountryController
}

