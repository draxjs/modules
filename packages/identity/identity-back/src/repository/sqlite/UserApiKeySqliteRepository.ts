import {IUserApiKey, IUserApiKeyBase} from '@drax/identity-share'
import {IUserApiKeyRepository} from '../../interfaces/IUserApiKeyRepository'
import {UUID} from "crypto";
import sqlite from "better-sqlite3";
import {randomUUID} from "node:crypto";
import {IDraxPaginateResult, IDraxPaginateOptions} from "@drax/common-share";
import {SqliteErrorToValidationError, SqliteTableBuilder, SqlQueryFilter, SqlSort} from "@drax/common-back";
import type {SqliteTableField} from "@drax/common-back";
import UserSqliteRepository from "./UserSqliteRepository.js";


const tableFields: SqliteTableField[] = [
    {name: "secret", type: "TEXT", unique: true, primary: false},
    {name: "name", type: "TEXT", unique: false, primary: false},
    {name: "user", type: "TEXT", unique: false, primary: false},
    {name: "ipv4", type: "TEXT", unique: false, primary: false},
    {name: "ipv6", type: "TEXT", unique: false, primary: false},
    {name: "createdAt", type: "TEXT", unique: false, primary: false}
]

class UserApiKeySqliteRepository implements IUserApiKeyRepository {

    private db: any;
    private dataBaseFile: string;
    private userRepository: UserSqliteRepository;

    constructor(dataBaseFile: string, verbose: boolean = false) {
        this.dataBaseFile = dataBaseFile
        this.userRepository = new UserSqliteRepository(dataBaseFile, verbose)
        this.db = new sqlite(dataBaseFile, {verbose: verbose ? console.log : null});
        this.table()
    }

    async findUserById(id: string) {
        return await this.userRepository.findById(id)
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

            if (userApiKeyData.ipv4 && Array.isArray(userApiKeyData.ipv4) && userApiKeyData.ipv4.length > 0) {
                userApiKeyData.ipv4 = userApiKeyData.ipv4.join(',')
            }else{
                userApiKeyData.ipv4 = ""
            }

            if (userApiKeyData.ipv6 && Array.isArray(userApiKeyData.ipv6) && userApiKeyData.ipv6.length > 0) {
                userApiKeyData.ipv6 = userApiKeyData.ipv6.join(',')
            }else{
                userApiKeyData.ipv6 = ""
            }

            userApiKeyData.createdAt = (new Date().toISOString())

            const fields = Object.keys(userApiKeyData)
                .map(field => `${field}`)
                .join(', ');

            const values = Object.keys(userApiKeyData)
                .map(field => `@${field}`)
                .join(', ');

            const stmt = this.db.prepare(`INSERT INTO user_api_keys (${fields})
                                          VALUES (${values})`);
            stmt.run(userApiKeyData)
            return this.findById(userApiKeyData.id as UUID)
        } catch (e) {
            console.log(e)
            throw SqliteErrorToValidationError(e, userApiKeyData)
        }
    }

    async findById(id: string): Promise<IUserApiKey | null> {
        const userApiKey = this.db.prepare('SELECT * FROM user_api_keys WHERE id = ?').get(id);
        userApiKey.ipv4 = userApiKey.ipv4 != "" ? userApiKey.ipv4.split(',') : []
        userApiKey.ipv6 = userApiKey.ipv6 != "" ? userApiKey.ipv6.split(',') : []
        userApiKey.user = await this.findUserById(userApiKey.user)
        return userApiKey
    }

    async findBySecret(secret: string): Promise<IUserApiKey | null> {
        const userApiKey = this.db.prepare('SELECT * FROM user_api_keys WHERE secret = ?').get(secret);
        userApiKey.ipv4 = userApiKey.ipv4 != "" ? userApiKey.ipv4.split(',') : []
        userApiKey.ipv6 = userApiKey.ipv6 != "" ? userApiKey.ipv6.split(',') : []
        userApiKey.user = await this.findUserById(userApiKey.user)
        return userApiKey
    }

    async update(id: string, userApiKeyData: IUserApiKeyBase): Promise<IUserApiKey> {
        try {

            if (userApiKeyData.ipv4 && Array.isArray(userApiKeyData.ipv4) && userApiKeyData.ipv4.length > 0) {
                userApiKeyData.ipv4 = userApiKeyData.ipv4.join(',')
            }else{
                userApiKeyData.ipv4 = ""
            }

            if (userApiKeyData.ipv6 && Array.isArray(userApiKeyData.ipv6) && userApiKeyData.ipv6.length > 0) {
                userApiKeyData.ipv6 = userApiKeyData.ipv6.join(',')
            }else{
                userApiKeyData.ipv6 = ""
            }

            delete userApiKeyData.secret

            const setClauses = Object.keys(userApiKeyData)
                .map(field => `${field} = @${field}`)
                .join(', ');

            userApiKeyData.id = id

            const stmt = this.db.prepare(`UPDATE user_api_keys
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
        const stmt = this.db.prepare('DELETE FROM user_api_keys WHERE id = ?');
        stmt.run(id);
        return true
    }


    async paginate({
                       page = 1,
                       limit = 5,
                       orderBy = '',
                       order = false,
                       search = '',
                       filters = []
                   }: IDraxPaginateOptions): Promise<IDraxPaginateResult<IUserApiKey>> {
        const offset = page > 1 ? (page - 1) * limit : 0

        let where = ""
        if (search) {
            where = ` WHERE name LIKE '%${search}%'`
        }

        where = SqlQueryFilter.applyFilters(where, filters)
        const sort = SqlSort.applySort(orderBy, order)

        console.log("where", where)

        const rCount = this.db.prepare('SELECT COUNT(*) as count FROM user_api_keys' + where).get();
        where += sort
        const userApiKeys = this.db.prepare('SELECT * FROM user_api_keys ' + where + ' LIMIT ? OFFSET ?').all([limit, offset]);

        for (const userApiKey of userApiKeys) {
            userApiKey.ipv4 = userApiKey.ipv4 != "" ? userApiKey.ipv4.split(',') : []
            userApiKey.ipv6 = userApiKey.ipv6 != "" ? userApiKey.ipv6.split(',') : []
            userApiKey.user = await this.findUserById(userApiKey.user)
        }

        return {
            page: page,
            limit: limit,
            total: rCount.count,
            items: userApiKeys
        }
    }


}

export default UserApiKeySqliteRepository
