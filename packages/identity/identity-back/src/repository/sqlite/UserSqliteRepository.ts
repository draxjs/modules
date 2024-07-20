import {IUser, IUserCreate, IUserUpdate} from "@drax/identity-share";
import sqlite from "better-sqlite3";
import {randomUUID} from "node:crypto";
import {UUID} from "crypto";
import {IUserRepository} from "../../interfaces/IUserRepository";
import {IDraxPaginateResult, IDraxPaginateOptions} from "@drax/common-share";
import {SqliteErrorToValidationError, SqliteTableBuilder, ValidationError} from "@drax/common-back";
import type {SqliteTableField} from "@drax/common-back";
import RoleSqliteRepository from "./RoleSqliteRepository.js";
import TenantSqliteRepository from "./TenantSqliteRepository.js";

const tableFields: SqliteTableField[] = [
    {name: "name", type: "TEXT", unique: false, primary: false},
    {name: "username", type: "TEXT", unique: true, primary: false},
    {name: "active", type: "INTEGER", unique: false, primary: false},
    {name: "active", type: "INTEGER", unique: false, primary: false},
    {name: "password", type: "TEXT", unique: false, primary: false},
    {name: "email", type: "TEXT", unique: true, primary: false},
    {name: "phone", type: "TEXT", unique: false, primary: false},
    {name: "role", type: "TEXT", unique: false, primary: false},
    {name: "tenant", type: "TEXT", unique: false, primary: false},
    {name: "groups", type: "TEXT", unique: false, primary: false},
    {name: "avatar", type: "TEXT", unique: false, primary: false},
    {name: "createdAt", type: "TEXT", unique: false, primary: false},
    {name: "updatedAt", type: "TEXT", unique: false, primary: false}
]

class UserSqliteRepository implements IUserRepository {
    private db: any;
    private roleRepository: RoleSqliteRepository;
    private tenantRepository: TenantSqliteRepository;
    private dataBaseFile: string;

    constructor(dataBaseFile: string, verbose: boolean = false) {
        this.dataBaseFile = dataBaseFile
        this.db = new sqlite(dataBaseFile, {verbose: verbose ? console.log : null});
        this.roleRepository = new RoleSqliteRepository(dataBaseFile, verbose)
        this.tenantRepository = new TenantSqliteRepository(dataBaseFile, verbose)
        this.table()
    }

    table() {
        const builder = new SqliteTableBuilder(
            this.dataBaseFile,
            'users',
            tableFields,
            false);
        builder.build('id')
    }

    normalizeData(userData: IUserCreate | IUserUpdate): void {
        if (userData.groups && Array.isArray(userData.groups)) {
            userData.groups = userData.groups.join(",")
        }
        userData.active = userData.active ? 1 : 0
    }

    async create(userData: IUserCreate): Promise<IUser> {
        if (!userData.id) {
            userData.id = randomUUID()
        }

        if (!await this.findRoleById(userData.role)) {
            throw new ValidationError([{field: 'role', reason: 'validation.notfound', value: userData.role}])
        }

        userData.createdAt = (new Date().toISOString())

        this.normalizeData(userData)

        try {

            const fields = Object.keys(userData)
                .map(field => `${field}`)
                .join(', ');

            const values = Object.keys(userData)
                .map(field => `@${field}`)
                .join(', ');

            const stmt = this.db.prepare(`INSERT INTO users (${fields})
                                          VALUES (${values})`);
            stmt.run(userData)
            return this.findById(userData.id as UUID)
        } catch (e) {
            throw SqliteErrorToValidationError(e, userData)
        }

    }

    async update(id: string, userData: IUserUpdate): Promise<IUser> {
        try {
            if (!await this.findRoleById(userData.role)) {
                throw new ValidationError([{field: 'role', reason: 'validation.notfound', value: userData.role}])
            }

            userData.updatedAt = (new Date().toISOString())

            this.normalizeData(userData)

            const setClauses = Object.keys(userData)
                .map(field => `${field} = @${field}`)
                .join(', ');
            userData.id = id
            const stmt = this.db.prepare(`UPDATE users
                                          SET ${setClauses}
                                          WHERE id = @id `);
            stmt.run(userData);
        } catch (e) {
            throw SqliteErrorToValidationError(e, userData)
        }
        return this.findById(id)
    }

    async delete(id: string): Promise<boolean> {
        const stmt = this.db.prepare('DELETE FROM users WHERE id = ?');
        stmt.run(id);
        return true
    }

    async deleteAll(): Promise<boolean> {
        const stmt = this.db.prepare('DELETE FROM users');
        stmt.run();
        return true
    }

    async findById(id: string): Promise<IUser> {
        const user = this.db.prepare('SELECT * FROM users WHERE id = ?').get(id);
        if (!user) {
            return null
        }
        user.role = await this.findRoleById(user.role)
        user.tenant = await this.findTenantById(user.tenant)
        return user
    }

    async findByUsername(username: string): Promise<IUser> {
        const user = this.db.prepare('SELECT * FROM users WHERE username = ?').get(username);
        if (!user) {
            return null
        }
        user.role = await this.findRoleById(user.role)
        user.tenant = await this.findTenantById(user.tenant)
        return user
    }

    async paginate({
                       page= 1,
                       limit= 5,
                       orderBy= '',
                       orderDesc= false,
                       search= '',
                       filters= []} : IDraxPaginateOptions): Promise<IDraxPaginateResult<IUser>> {

        const offset = page > 1 ? (page - 1) * limit : 0

        let where=""
        if (search) {
            where = ` WHERE (name LIKE '%${search}%' OR username LIKE '%${search}%') `
        }

        let whereFilters= []
        if(filters && filters.length > 0 ){
            where = where ? ` AND ` : ` WHERE `
            for(const filter of filters){
                if(filter.operator === '$eq'){
                    whereFilters.push(` ${filter.field} = '${filter.value}' `)
                }
                if(filter.operator === '$ne'){
                    whereFilters.push(` ${filter.field} != '${filter.value}' `)
                }
                if(filter.operator === '$in'){
                    whereFilters.push(` ${filter.field} LIKE '%${filter.value}%' `)
                }
            }
            where += whereFilters.join(" AND ")
        }

       // console.log("paginate where ", where, "search", search, "filters", filters, "whereFilters", whereFilters)

        const rCount = this.db.prepare('SELECT COUNT(*) as count FROM users' + where).get();

        const users = this.db.prepare('SELECT * FROM users'  + where + ' LIMIT ? OFFSET ?').all([limit, offset]);

        for (const user of users) {

            let role = await this.findRoleById(user.role)
            user.role = role ? role : null

            let tenant = await this.findTenantById(user.tenant)
            user.tenant = tenant ? tenant : null

            user.active = user.active === 1
        }

        return {
            page: page,
            limit: limit,
            total: rCount.count,
            items: users
        }
    }

    async findRoleById(id: string) {
        return await this.roleRepository.findById(id)
    }

    async findTenantById(id: string) {
        return await this.tenantRepository.findById(id)
    }

    async changePassword(id: string, password: string): Promise<boolean> {
        const stmt = this.db.prepare(`UPDATE users
                                      SET password = @password
                                      WHERE id = @id `);
        stmt.run({id: id, password: password});
        return true
    }

    async changeAvatar(id: string, avatar: string): Promise<boolean> {
        const stmt = this.db.prepare(`UPDATE users
                                      SET avatar = @avatar
                                      WHERE id = @id `);
        stmt.run({id: id, avatar: avatar});
        return true
    }
}

export default UserSqliteRepository
