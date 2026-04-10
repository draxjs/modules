import type {SqliteTableField} from "@drax/common-back";
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {IUserPasswordHistoryRepository} from "../../interfaces/IUserPasswordHistoryRepository.js";
import type {IUserPasswordHistory, IUserPasswordHistoryCreate} from "../../interfaces/IUserPasswordHistory.js";

class UserPasswordHistorySqliteRepository extends AbstractSqliteRepository<IUserPasswordHistory, IUserPasswordHistoryCreate, IUserPasswordHistoryCreate> implements IUserPasswordHistoryRepository {
    protected db: any;
    protected tableName: string = "user_password_history";
    protected dataBaseFile: string;
    protected searchFields: string[] = [];
    protected booleanFields: string[] = [];
    protected identifier: string = "_id";
    protected populateFields = [
        {field: "user", table: "users", identifier: "_id"}
    ]
    protected tableFields: SqliteTableField[] = [
        {name: "user", type: "TEXT", unique: false, primary: false},
        {name: "passwordHash", type: "TEXT", unique: false, primary: false},
        {name: "createdAt", type: "TEXT", unique: false, primary: false},
        {name: "updatedAt", type: "TEXT", unique: false, primary: false},
    ]
    protected verbose: boolean;

    async prepareData(): Promise<void> {
    }

    async prepareItem(item: IUserPasswordHistory): Promise<void> {
        if (item.createdAt && typeof item.createdAt === "string") {
            item.createdAt = new Date(item.createdAt)
        }

        if (item.updatedAt && typeof item.updatedAt === "string") {
            item.updatedAt = new Date(item.updatedAt)
        }
    }

    async findLatestByUserId(userId: string, limit: number): Promise<IUserPasswordHistory[]> {
        const rows = this.db.prepare(`SELECT * FROM ${this.tableName} WHERE user = ? ORDER BY createdAt DESC LIMIT ?`).all(userId, limit);
        for (const row of rows) {
            await this.decorate(row)
        }
        return rows
    }
}

export default UserPasswordHistorySqliteRepository
export {UserPasswordHistorySqliteRepository}
