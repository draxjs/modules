
import type {ICountry, ICountryBase} from './ICountry'
import {IDraxCrud} from "@drax/crud-share";

interface ICountryRepository extends IDraxCrud<ICountry, ICountryBase, ICountryBase>{

}

export {ICountryRepository}


