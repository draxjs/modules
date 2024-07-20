import {IUserApiKey, IUserApiKeyBase} from '@drax/identity-share'
import {IUserApiKeyRepository} from '../../interfaces/IUserApiKeyRepository'
import {UUID} from "crypto";
import sqlite from "better-sqlite3";
import {randomUUID} from "node:crypto";
import {IDraxPaginateResult, IDraxPaginateOptions} from "@drax/common-share";
import {SqliteErrorToValidationError, SqliteTableBuilder} from "@drax/common-back";
import type {SqliteTableField} from "@drax/common-back";


const tableFields: SqliteTableField[] = [
    {name: "name", type: "TEXT", unique: false, primary: false},
    {name: "secret", type: "TEXT", unique: true, primary: false},
    {name: "user", type: "TEXT", unique: true, primary: false},
    {name: "createdAt", type: "TEXT", unique: false, primary: false}
]

class UserApiKeySqliteRepository implements IUserApiKeyRepository {

    private db: any;
    private dataBaseFile: string;

    constructor(dataBaseFile: string, verbose: boolean = false) {
        this.dataBaseFile = dataBaseFile
        this.db = new sqlite(dataBaseFile, {verbose: verbose ? console.log : null});
        this.table()
    }

    table() {
        const builder = new SqliteTableBuilder(
            this.dataBaseFile,
            'user_api_keys',
            tableFields,
            false);
        builder.build('id')
    }


    async create(userApiKeyData: IUserApiKeyBase): Promise<IUserApiKey> {
        try {

            if (!userApiKeyData.id) {
                userApiKeyData.id = randomUUID()
            }

            userApiKeyData.createdAt = (new Date().toISOString())

            const fields = Object.keys(userApiKeyData)
                .map(field => `${field}`)
                .join(', ');

            const values = Object.keys(userApiKeyData)
                .map(field => `@${field}`)
                .join(', ');

            const stmt = this.db.prepare(`INSERT INTO userApiKeys (${fields})
                                          VALUES (${values})`);
            stmt.run(userApiKeyData)
            return this.findById(userApiKeyData.id as UUID)
        } catch (e) {
            console.log(e)
            throw SqliteErrorToValidationError(e, userApiKeyData)
        }
    }

    async findById(id: string): Promise<IUserApiKey | null> {
        const userApiKey = this.db.prepare('SELECT * FROM userApiKeys WHERE id = ?').get(id);
        return userApiKey
    }

    async findBySecret(secret: string): Promise<IUserApiKey | null> {
        const userApiKey = this.db.prepare('SELECT * FROM userApiKeys WHERE secret = ?').get(secret);
        return userApiKey
    }

    async update(id: string, userApiKeyData: IUserApiKeyBase): Promise<IUserApiKey> {
        try {
            const setClauses = Object.keys(userApiKeyData)
                .map(field => `${field} = @${field}`)
                .join(', ');
            userApiKeyData.id = id
            const stmt = this.db.prepare(`UPDATE userApiKeys
                                          SET ${setClauses}
                                          WHERE id = @id `);
            stmt.run(userApiKeyData);
            return this.findById(id)
        } catch (e) {
            console.log(e)
            throw SqliteErrorToValidationError(e, userApiKeyData)
        }

    }

    async delete(id: string): Promise<boolean> {
        const stmt = this.db.prepare('DELETE FROM userApiKeys WHERE id = ?');
        stmt.run(id);
        return true
    }


    async paginate({
                       page = 1,
                       limit = 5,
                       orderBy = '',
                       orderDesc = false,
                       search = '',
                       filters = []
                   }: IDraxPaginateOptions): Promise<IDraxPaginateResult<IUserApiKey>> {
        const offset = page > 1 ? (page - 1) * limit : 0

        let where = ""
        if (search) {
            where = ` WHERE name LIKE '%${search}%'`
        }

        const rCount = this.db.prepare('SELECT COUNT(*) as count FROM userApiKeys' + where).get();
        const userApiKeys = this.db.prepare('SELECT * FROM userApiKeys ' + where + ' LIMIT ? OFFSET ?').all([limit, offset]);

        return {
            page: page,
            limit: limit,
            total: rCount.count,
            items: userApiKeys
        }
    }


}

export default UserApiKeySqliteRepository
