
import type{ICountryRepository} from "../interfaces/ICountryRepository";
import type {ICountryBase, ICountry} from "../interfaces/ICountry";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class CountryService extends AbstractService<ICountry, ICountryBase, ICountryBase> {

    constructor(CountryRepository: ICountryRepository, schema?: ZodObject<ZodRawShape>) {
        super(CountryRepository, schema);
    }

}

export default CountryService
export {CountryService}
