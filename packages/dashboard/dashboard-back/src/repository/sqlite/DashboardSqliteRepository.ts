import {IDashboardRepository} from '../../interfaces/IDashboardRepository'
import {IDashboard, IDashboardBase} from "@drax/dashboard-share";
import {
    SqliteTableField,
} from "@drax/common-back";
import {AbstractSqliteRepository} from "@drax/crud-back";


class DashboardSqliteRepository extends AbstractSqliteRepository<IDashboard,IDashboardBase, IDashboardBase> implements IDashboardRepository{

    protected db: any;
    protected tableName: string = 'dashboards';
    protected dataBaseFile: string;
    protected searchFields: string[] = [];
    protected booleanFields: string[] = [];
    protected identifier: string = '_id';
    protected populateFields = []
    protected tableFields: SqliteTableField[] = [
        {name: "identifier", type: "TEXT", unique: true, primary: false},
        {name: "title", type: "TEXT", unique: true, primary: false},
        {name: "cards", type: "TEXT", unique: false, primary: false},
        {name: "createdAt", type: "TEXT", unique: false, primary: false},
        {name: "updatedAt", type: "TEXT", unique: false, primary: false},
    ]
    protected verbose: boolean = false;


    async prepareData(data: any) {
        if (!data) {
            return
        }

        if (data && data.cards) {
            data.cards = JSON.stringify(data.cards)
        }
    }

    async prepareItem(item: any) {

        if (!item) {
            return
        }

        if (item && item.cards) {
            item.cards = JSON.parse(item.cards)
        }
    }

}

export default DashboardSqliteRepository
export {DashboardSqliteRepository}
