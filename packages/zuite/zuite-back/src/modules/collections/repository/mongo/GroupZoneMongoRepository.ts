
import {AbstractMongoRepository} from "@drax/crud-back";
import {GroupZoneModel} from "../../models/GroupZoneModel.js";
import type {IGroupZoneRepository} from '../../interfaces/IGroupZoneRepository'
import type {IGroupZone, IGroupZoneBase} from "../../interfaces/IGroupZone";


class GroupZoneMongoRepository extends AbstractMongoRepository<IGroupZone, IGroupZoneBase, IGroupZoneBase> implements IGroupZoneRepository {

    constructor() {
        super();
        this._model = GroupZoneModel;
        this._searchFields = ['name'];
        this._populateFields = ['users'];
        this._lean = true
    }

}

export default GroupZoneMongoRepository
export {GroupZoneMongoRepository}

