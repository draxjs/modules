import {PaginateResult} from "mongoose";
import {IUser} from "../../interfaces/IUser";
import * as process from "node:process";
import sqlite from "better-sqlite3";
import {randomUUID} from "node:crypto";
import {UUID} from "crypto";

const DATABASE = process.env.SQLITE_DATABASE ? process.env.SQLITE_DATABASE : 'drax.db'

const userTableSQL: string = `
    CREATE TABLE IF NOT EXISTS users
    (
        id TEXT PRIMARY KEY,
        username TEXT,
        active INTEGER,
        password TEXT,
        email TEXT,
        phone TEXT,
        role TEXT,
        avatar TEXT
    );
`;

class UserSqliteRepository {
    private db: any;

    constructor() {
        this.db = new sqlite(DATABASE, {verbose: console.log});
        this.table()
    }

    table() {
        this.db.exec(userTableSQL);
    }

    async create(userData: IUser): Promise<IUser> {
        userData.id = randomUUID()
        userData.active = !!userData
        const stmt = this.db.prepare('INSERT INTO users VALUES (@id, @username, @email, @password, @phone, @role, @active, @avatar)');
        stmt.run(userData)
        return this.findById(userData.id)
    }

    async update(id: UUID, userData: IUser): Promise<IUser> {
        userData.id = id
        const stmt = this.db.prepare('UPDATE users SET username = @username, email = @email, password = @password, phone = @phone, role = @role, active = @active, avatar = @avatar WHERE id = @id');
        stmt.run(userData);
        return this.findById(id)
    }

    async delete(id: UUID): Promise<boolean> {
        const stmt = this.db.prepare('DELETE FROM users WHERE id = @id');
        stmt.run(id);
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

    async paginate(page, limit, filters): Promise<PaginateResult<IUser>> {
        const offset = (page - 1) * limit
        const result = this.db.prepare('SELECT * FROM users LIMIT ? OFFSET ?').all([limit, offset]);
        return result
    }
}

export default UserSqliteRepository
