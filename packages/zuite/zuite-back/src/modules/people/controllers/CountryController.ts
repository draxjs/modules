
import CountryServiceFactory from "../factory/CountryServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import CountryPermissions from "../permissions/CountryPermissions.js";
import type {ICountry, ICountryBase} from "../interfaces/ICountry";

class CountryController extends AbstractFastifyController<ICountry, ICountryBase, ICountryBase>   {

    constructor() {
        super(CountryServiceFactory.instance, CountryPermissions)
    }

}

export default CountryController;
export {
    CountryController
}

