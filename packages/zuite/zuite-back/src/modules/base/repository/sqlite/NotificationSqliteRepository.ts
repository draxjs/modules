
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {INotificationRepository} from '../../interfaces/INotificationRepository'
import type {INotification, INotificationBase} from "../../interfaces/INotification";
import {SqliteTableField} from "@drax/common-back";

class NotificationSqliteRepository extends AbstractSqliteRepository<INotification, INotificationBase, INotificationBase> implements INotificationRepository {

    protected db: any;
    protected tableName: string = 'Notification';
    protected dataBaseFile: string;
    protected searchFields: string[] = ['title', 'message', 'type', 'status'];
    protected booleanFields: string[] = [];
    protected identifier: string = '_id';
    protected populateFields = [
        { field: 'user', table: 'user', identifier: '_id' }
    ]
    protected verbose: boolean = false;
    protected tableFields: SqliteTableField[] = [
        {name: "title", type: "TEXT", unique: undefined, primary: false},
{name: "message", type: "TEXT", unique: undefined, primary: false},
{name: "type", type: "TEXT", unique: undefined, primary: false},
{name: "status", type: "TEXT", unique: undefined, primary: false},
{name: "user", type: "TEXT", unique: undefined, primary: false},
{name: "metadata", type: "TEXT", unique: undefined, primary: false},
{name: "readAt", type: "TEXT", unique: undefined, primary: false}
    ]
  
}

export default NotificationSqliteRepository
export {NotificationSqliteRepository}

