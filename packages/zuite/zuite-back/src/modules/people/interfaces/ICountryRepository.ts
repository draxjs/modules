
import type {ICountry, ICountryBase} from './ICountry'
import {ICrudRepository} from "@drax/crud-back";

interface ICountryRepository extends ICrudRepository<ICountry, ICountryBase, ICountryBase>{

}

export {ICountryRepository}


