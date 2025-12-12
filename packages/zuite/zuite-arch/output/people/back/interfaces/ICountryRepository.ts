
import type {ICountry, ICountryBase} from './ICountry'
import {IDraxCrudRepository} from "@drax/crud-share";

interface ICountryRepository extends IDraxCrudRepository<ICountry, ICountryBase, ICountryBase>{

}

export {ICountryRepository}


