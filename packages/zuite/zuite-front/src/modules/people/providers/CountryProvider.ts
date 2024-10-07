
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {ICountry, ICountryBase} from '../interfaces/ICountry'
import type {IDraxCrudProvider} from "@drax/crud-share";

class CountryProvider extends AbstractCrudRestProvider<ICountry, ICountryBase, ICountryBase> implements IDraxCrudProvider<ICountry, ICountryBase, ICountryBase> {

  static singleton: CountryProvider

  constructor() {
   super('/api/country')
  }

  static get instance() {
    if(!CountryProvider.singleton){
      CountryProvider.singleton = new CountryProvider()
    }
    return CountryProvider.singleton
  }



}


export default CountryProvider
