
import {AbstractMongoRepository} from "@drax/crud-back";
import {DashboardModel} from "../../models/DashboardModel.js";
import type {IDashboardRepository} from '../../interfaces/IDashboardRepository'
import type {IDashboard, IDashboardBase} from "@drax/dashboard-share";


class DashboardMongoRepository extends AbstractMongoRepository<IDashboard, IDashboardBase, IDashboardBase> implements IDashboardRepository {

    constructor() {
        super();
        this._model = DashboardModel;
        this._searchFields = ['identifier', 'title'];
         this._populateFields = [];
    }

}

export default DashboardMongoRepository
export {DashboardMongoRepository}

