import {IUserApiKey, IUserApiKeyBase} from '@drax/identity-share'
import {IUserApiKeyRepository} from '../../interfaces/IUserApiKeyRepository'
import sqlite from "better-sqlite3";
import type {SqliteTableField} from "@drax/common-back";
import UserSqliteRepository from "./UserSqliteRepository.js";
import {AbstractSqliteRepository} from "@drax/crud-back";


class UserApiKeySqliteRepository extends AbstractSqliteRepository<IUserApiKey, IUserApiKeyBase, IUserApiKeyBase> implements IUserApiKeyRepository {

    private userRepository: UserSqliteRepository;

    protected db: any;
    protected tableName: string = 'user_api_keys';
    protected dataBaseFile: string;
    protected searchFields: string[] = [];
    protected booleanFields: string[] = [];
    protected identifier: string = '_id';
    protected populateFields = []
    protected tableFields: SqliteTableField[] = [
        {name: "secret", type: "TEXT", unique: true, primary: false},
        {name: "name", type: "TEXT", unique: false, primary: false},
        {name: "user", type: "TEXT", unique: false, primary: false},
        {name: "ipv4", type: "TEXT", unique: false, primary: false},
        {name: "ipv6", type: "TEXT", unique: false, primary: false},
        {name: "createdBy", type: "TEXT", unique: false, primary: false},
        {name: "createdAt", type: "TEXT", unique: false, primary: false}
    ]
    protected verbose: boolean;

    constructor(dataBaseFile: string, verbose: boolean = false) {
        super(dataBaseFile, verbose)
        this.dataBaseFile = dataBaseFile
        this.userRepository = new UserSqliteRepository(dataBaseFile, verbose)
        this.db = new sqlite(dataBaseFile, {verbose: verbose ? console.log : null});
    }

    async findUserById(id: string) {
        return await this.userRepository.findById(id)
    }

    async prepareItem(item: any): Promise<any> {
        if (item && item.user) {
            item.user = await this.findUserById(item.user)
        }

        if (item && item.createdBy) {
            item.createdBy = await this.findUserById(item.createdBy)
        }

        if (item && item.ipv4) {
            item.ipv4 = item.ipv4 != "" ? item.ipv4.split(',') : []
        }

        if (item && item.ipv6) {
            item.ipv6 = item.ipv6 != "" ? item.ipv6.split(',') : []
        }
    }

    async prepareData(userApiKeyData) {
        if (userApiKeyData.ipv4 && Array.isArray(userApiKeyData.ipv4) && userApiKeyData.ipv4.length > 0) {
            userApiKeyData.ipv4 = userApiKeyData.ipv4.join(',')
        } else {
            userApiKeyData.ipv4 = ""
        }

        if (userApiKeyData.ipv6 && Array.isArray(userApiKeyData.ipv6) && userApiKeyData.ipv6.length > 0) {
            userApiKeyData.ipv6 = userApiKeyData.ipv6.join(',')
        } else {
            userApiKeyData.ipv6 = ""
        }
    }


    async findBySecret(secret: string): Promise<IUserApiKey | null> {
        const userApiKey = this.db.prepare('SELECT * FROM user_api_keys WHERE secret = ?').get(secret);
        await this.decorate(userApiKey)
        return userApiKey
    }

}

export default UserApiKeySqliteRepository
