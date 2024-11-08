
import {AbstractMongoRepository} from "@drax/crud-back";
import {CountryModel} from "../models/CountryModel.js";
import type {ICountryRepository} from '../interfaces/ICountryRepository'
import type {ICountry, ICountryBase} from "../interfaces/ICountry";


class CountryMongoRepository extends AbstractMongoRepository<ICountry, ICountryBase, ICountryBase> implements ICountryRepository {

    constructor() {
        super();
        this._model = CountryModel;
        this._searchFields = ['name', 'description'];
         this._populateFields = [];
    }

}

export default CountryMongoRepository
export {CountryMongoRepository}

