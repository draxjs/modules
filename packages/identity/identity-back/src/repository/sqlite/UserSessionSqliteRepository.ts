import {IUserSession, IUserSessionBase} from '@drax/identity-share'
import {IUserSessionRepository} from '../../interfaces/IUserSessionRepository'
import type {SqliteTableField} from "@drax/common-back";
import {AbstractSqliteRepository} from "@drax/crud-back";
import UserSqliteRepository from "./UserSqliteRepository.js";

class UserSessionSqliteRepository extends AbstractSqliteRepository<IUserSession,IUserSessionBase,IUserSessionBase> implements IUserSessionRepository{


    protected db: any;
    protected tableName: string = 'user_sessions';
    protected dataBaseFile: string;
    protected searchFields: string[] = [];
    protected booleanFields: string[] = [];
    protected identifier: string = '_id';
    protected populateFields = [{field: 'user', table: 'users', identifier: '_id'}]
    protected tableFields: SqliteTableField[] = [
        {name: "uuid", type: "TEXT", unique: false, primary: false},
        {name: "user", type: "TEXT", unique: false, primary: false},
        {name: "agent", type: "TEXT", unique: false, primary: false},
        {name: "ip", type: "TEXT", unique: false, primary: false},
        {name: "createdAt", type: "TEXT", unique: false, primary: false},
        {name: "updatedAt", type: "TEXT", unique: false, primary: false},
    ]
    protected verbose: boolean;


    async prepareData(data: any): Promise<void> {
        // Transform data before saving to database if needed
    }

    async prepareItem(item: any): Promise<void> {
        if (item.createdAt && typeof item.createdAt === 'string') {
            item.createdAt = new Date(item.createdAt);
        }

        if (item.updatedAt && typeof item.updatedAt === 'string') {
            item.updatedAt = new Date(item.updatedAt);
        }
    }

}

export default UserSessionSqliteRepository
