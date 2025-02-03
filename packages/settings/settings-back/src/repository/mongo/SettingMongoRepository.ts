import {AbstractMongoRepository} from "@drax/crud-back";
import type {ISettingRepository} from "../../interfaces/ISettingRepository";
import {SettingModel} from "../../model/SettingsModel.js";
import {ISetting, ISettingBase} from "@drax/settings-share";


class SettingMongoRepository extends AbstractMongoRepository<ISetting,ISettingBase,ISettingBase> implements ISettingRepository {


    constructor() {
        super();
        //@ts-ignore
        this._model = SettingModel;

        this._searchFields = ['_id', 'key'];
        this._populateFields = [];
    }


}

export default SettingMongoRepository;
export {SettingMongoRepository};
