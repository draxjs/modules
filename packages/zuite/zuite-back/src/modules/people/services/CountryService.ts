
import type{ICountryRepository} from "../interfaces/ICountryRepository";
import type {ICountryBase, ICountry} from "../interfaces/ICountry";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class CountryService extends AbstractService<ICountry, ICountryBase, ICountryBase> {


    constructor(CountryRepository: ICountryRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(CountryRepository, baseSchema, fullSchema);

        this._validateOutput = true

    }

}

export default CountryService
export {CountryService}
