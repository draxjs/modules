import {IUser} from "../../interfaces/IUser";
import sqlite from "better-sqlite3";
import {randomUUID} from "node:crypto";
import {UUID} from "crypto";
import {IUserRepository} from "../../interfaces/IUserRepository";
import type {IPaginateResult} from "@drax/common-back";
import {UniqueError, ValidationError} from "@drax/common-back";


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

    constructor(DATABASE, verbose = console.log) {
        this.db = new sqlite(DATABASE, {verbose});
        this.table()
    }

    table() {
        this.db.exec(userTableSQL);
    }



    async create(userData: IUser): Promise<IUser> {
        if(!userData.id){
            userData.id = randomUUID()
        }
        if(userData.groups && Array.isArray(userData.groups)){
            userData.groups = userData.groups.join(",")
        }
        userData.active = !!userData ? 1 : 0

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
            if(e.code === 'SQLITE_CONSTRAINT_PRIMARYKEY'){
                throw new ValidationError([{entity:'User', field: 'id', value:userData.id, reason:'validation.unique'}])
            }

            if(e.code === 'SQLITE_CONSTRAINT_UNIQUE'){
                const msg = e.message.split(".")
                const field = msg.length === 2 ? msg[1]: 'unknown'
                throw new ValidationError([{entity:'User', field: field, value:userData.id, reason:'validation.unique'}])
            }

            throw new Error(e.message)
        }

    }

    async update(id: UUID, userData: IUser): Promise<IUser> {
        try {
            userData.id = id

            const setClauses = Object.keys(userData)
                .map(field => `${field} = @${field}`)
                .join(', ');

            const stmt = this.db.prepare( `UPDATE users SET ${setClauses} WHERE id = @id `);
            stmt.run(userData);
        }catch (e){
            if(e.code === 'SQLITE_CONSTRAINT_UNIQUE'){
                const msg = e.message.split(".")
                const field = msg.length === 2 ? msg[1]: 'unknown'
                throw new ValidationError([{entity:'User', field: field, value:userData.id, reason:'validation.unique'}])
            }
            throw new Error(e.message)
        }
        return this.findById(id)
    }

    async delete(id: UUID): Promise<boolean> {
        const stmt = this.db.prepare('DELETE FROM users WHERE id = @id');
        stmt.run(id);
        return true
    }

    async deleteAll(): Promise<boolean> {
        const stmt = this.db.prepare('DELETE FROM users');
        stmt.run();
        return true
    }

    async findById(id: UUID): Promise<IUser> {
        const result = this.db.prepare('SELECT * FROM users WHERE id = ?').get(id);
        return result
    }

    async findByUsername(username: string): Promise<IUser> {
        const result = this.db.prepare('SELECT * FROM users WHERE username = ?').get(username);
        return result
    }

    async paginate(page:number = 1, limit:number = 5): Promise<IPaginateResult> {
        const offset = (page - 1) * limit
        const rCount = this.db.prepare('SELECT COUNT(*) as count FROM users').get();
        const result = this.db.prepare('SELECT * FROM users LIMIT ? OFFSET ?').all([limit, offset]);
        return {
            page: page,
            limit: 1,
            total: rCount.count,
            items: result
        }
    }
}

export default UserSqliteRepository
