
import {AbstractMongoRepository} from "@drax/crud-back";
import {LanguageModel} from "../../models/LanguageModel.js";
import type {ILanguageRepository} from '../../interfaces/ILanguageRepository'
import type {ILanguage, ILanguageBase} from "../../interfaces/ILanguage";


class LanguageMongoRepository extends AbstractMongoRepository<ILanguage, ILanguageBase, ILanguageBase> implements ILanguageRepository {

    constructor() {
        super();
        this._model = LanguageModel;
        this._searchFields = ['name'];
         this._populateFields = [];
    }

}

export default LanguageMongoRepository
export {LanguageMongoRepository}

