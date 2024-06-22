import {IUser, IUserCreate, IUserUpdate} from "../../interfaces/IUser";
import sqlite from "better-sqlite3";
import {randomUUID} from "node:crypto";
import {UUID} from "crypto";
import {IUserRepository} from "../../interfaces/IUserRepository";
import type {IPaginateFilter, IPaginateResult} from "@drax/common-back";
import { SqliteErrorToValidationError, ValidationError} from "@drax/common-back";
import RoleSqliteRepository from "./RoleSqliteRepository.js";
import TenantSqliteRepository from "./TenantSqliteRepository.js";
import {IID} from "../../interfaces/IID";


const userTableSQL: string = `
    CREATE TABLE IF NOT EXISTS users
    (
        id TEXT PRIMARY KEY,
        name TEXT,
        username TEXT UNIQUE,
        active INTEGER,
        password TEXT,
        email TEXT UNIQUE,
        phone TEXT,
        role TEXT,
        tenant TEXT,
        groups TEXT,
        avatar TEXT
    );
`;

class UserSqliteRepository implements IUserRepository {
    private db: any;
    private roleRepository: RoleSqliteRepository;
    private tenantRepository: TenantSqliteRepository;

    constructor(DATABASE: string, verbose: boolean = false) {
        this.db = new sqlite(DATABASE, {verbose: verbose ? console.log : null});
        this.roleRepository = new RoleSqliteRepository(DATABASE, verbose)
        this.tenantRepository = new TenantSqliteRepository(DATABASE, verbose)
        this.table()
    }

    table() {
        this.db.exec(userTableSQL);
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

    async update(id: UUID, userData: IUserUpdate): Promise<IUser> {
        try {
            if (!await this.findRoleById(userData.role)) {
                throw new ValidationError([{field: 'role', reason: 'validation.notfound', value: userData.role}])
            }

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

    async delete(id: UUID): Promise<boolean> {
        const stmt = this.db.prepare('DELETE FROM users WHERE id = ?');
        stmt.run(id);
        return true
    }

    async deleteAll(): Promise<boolean> {
        const stmt = this.db.prepare('DELETE FROM users');
        stmt.run();
        return true
    }

    async findById(id: UUID): Promise<IUser> {
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

    async paginate(page: number = 1, limit: number = 5, search: string = "", filters:IPaginateFilter[] = []): Promise<IPaginateResult> {

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

    async findRoleById(id: IID) {
        return await this.roleRepository.findById(id)
    }

    async findTenantById(id: IID) {
        return await this.tenantRepository.findById(id)
    }

    async changePassword(id: IID, password: string): Promise<boolean> {
        const stmt = this.db.prepare(`UPDATE users
                                      SET password = @password
                                      WHERE id = @id `);
        stmt.run({id: id, password: password});
        return true
    }
}

export default UserSqliteRepository
