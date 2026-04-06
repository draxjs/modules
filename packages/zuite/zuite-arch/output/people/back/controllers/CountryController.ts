
import CountryServiceFactory from "../factory/services/CountryServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import CountryPermissions from "../permissions/CountryPermissions.js";
import type {ICountry, ICountryBase} from "../interfaces/ICountry";

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

}

export default CountryController;
export {
    CountryController
}

