import {IRole} from '../../interfaces/IRole'
import {IRoleRepository} from '../../interfaces/IRoleRepository'
import { PaginateResult} from "mongoose";
import {UUID} from "crypto";
import process from "node:process";
import sqlite from "better-sqlite3";
import {randomUUID} from "node:crypto";
import {IPaginateFilter} from "@drax/common-back";

const DATABASE = process.env.SQLITE_DATABASE ? process.env.SQLITE_DATABASE : 'drax.db'

const roleTableSQL: string = `
    CREATE TABLE IF NOT EXISTS roles
    (
        id TEXT PRIMARY KEY,
        name TEXT,
        permissions TEXT
    );
`;

class RoleSqliteRepository implements IRoleRepository{

    private db: any;

    constructor() {
        this.db = new sqlite(DATABASE, {verbose: console.log});
        this.table()
    }

    table() {
        this.db.exec(roleTableSQL);
    }

    async create(roleData: IRole): Promise<IRole> {
        roleData.id = randomUUID()
        const stmt = this.db.prepare('INSERT INTO user VALUES (@id, @name, @permissions)');
        stmt.run(roleData)
        return this.findById(roleData.id)
    }

    async update(id: UUID, roleData: IRole): Promise<IRole> {
        roleData.id = id
        const stmt = this.db.prepare('UPDATE roles SET name = @name, permissions = @permissions,  WHERE id = @id');
        stmt.run(roleData);
        return this.findById(id)
    }

    async delete(id: UUID): Promise<boolean> {
        const stmt = this.db.prepare('DELETE FROM roles WHERE id = @id');
        stmt.run(id);
        return true
    }

    async findById(id: UUID): Promise<IRole | null>{
        const result = this.db.prepare('SELECT * FROM roles WHERE id = ?').get(id);
        return result
    }

    async fetch(): Promise<IRole[]>{
        const result = this.db.prepare('SELECT * FROM roles').all();
        return result
    }

    async paginate(page = 1, limit = 5): Promise<PaginateResult<IRole>>{
        const offset = (page - 1) * limit
        const result = this.db.prepare('SELECT * FROM roles LIMIT ? OFFSET ?').all([limit, offset]);
        return result
    }
}

export default RoleSqliteRepository
