import {IUser} from "../../interfaces/IUser";
import sqlite from "better-sqlite3";
import {randomUUID} from "node:crypto";
import {UUID} from "crypto";
import {IUserRepository} from "../../interfaces/IUserRepository";
import type {IPaginateResult} from "@drax/common-back";
import {SqliteErrorToValidationError} from "@drax/common-back";
import RoleSqliteRepository from "./RoleSqliteRepository.js";


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
        groups TEXT,
        avatar TEXT
    );
`;

class UserSqliteRepository implements IUserRepository{
    private db: any;
    private roleRepository: RoleSqliteRepository;

    constructor(DATABASE: string, verbose: boolean = false) {
        this.db = new sqlite(DATABASE, {verbose: verbose ? console.log : null});
        this.roleRepository = new RoleSqliteRepository(DATABASE, verbose)

    }

    table() {
        this.db.exec(userTableSQL);
    }

    normalizeData(userData: IUser){
        if(userData.groups && Array.isArray(userData.groups)){
            userData.groups = userData.groups.join(",")
        }
        userData.active = userData.active ? 1 : 0
    }

    async create(userData: IUser): Promise<IUser> {
        if(!userData.id){
            userData.id = randomUUID()
        }

        this.normalizeData(userData)

        try{

            const fields = Object.keys(userData)
                .map(field => `${field}`)
                .join(', ');

            const values = Object.keys(userData)
                .map(field => `@${field}`)
                .join(', ');

            /*console.log("fields", fields)
            console.log("values",values)
            console.log("userData",userData)*/

            const stmt = this.db.prepare(`INSERT INTO users (${fields}) VALUES (${values})`);
            stmt.run(userData)
            return this.findById(userData.id as UUID)
        }catch (e){
            throw SqliteErrorToValidationError(e, userData)
        }

    }

    async update(id: UUID, userData: IUser): Promise<IUser> {
        try {
            this.normalizeData(userData)

            const setClauses = Object.keys(userData)
                .map(field => `${field} = @${field}`)
                .join(', ');
            userData.id = id
            const stmt = this.db.prepare( `UPDATE users SET ${setClauses} WHERE id = @id `);
            stmt.run(userData);
        }catch (e){
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
        if(!user){
            return null
        }
        user.role = await this.populateRole(user.role)
        return user
    }

    async findByUsername(username: string): Promise<IUser> {
        const user = this.db.prepare('SELECT * FROM users WHERE username = ?').get(username);
        if(!user){
            return null
        }
        user.role = await this.populateRole(user.role)
        return user
    }

    async paginate(page:number = 1, limit:number = 5): Promise<IPaginateResult> {
        const offset = (page - 1) * limit
        const rCount = this.db.prepare('SELECT COUNT(*) as count FROM users').get();
        const users = this.db.prepare('SELECT * FROM users LIMIT ? OFFSET ?').all([limit, offset]);

        for (const user of users) {
            user.role = await this.populateRole(user.role)
            user.active = user.active === 1
        }

        return {
            page: page,
            limit: limit,
            total: rCount.count,
            items: users
        }
    }

    async populateRole(id : UUID){
        return await this.roleRepository.findById(id)
    }
}

export default UserSqliteRepository
