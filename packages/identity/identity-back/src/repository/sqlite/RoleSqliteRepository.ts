import {IRole} from '../../interfaces/IRole'
import {IRoleRepository} from '../../interfaces/IRoleRepository'
import {UUID} from "crypto";
import sqlite from "better-sqlite3";
import {randomUUID} from "node:crypto";
import {IPaginateFilter, IPaginateResult, ValidationError} from "@drax/common-back";
import {SqliteErrorToValidationError} from "@drax/common-back";

const roleTableSQL: string = `
    CREATE TABLE IF NOT EXISTS roles
    (
        id TEXT PRIMARY KEY,
        name TEXT,
        permissions TEXT,
        readonly INTEGER,
        childRoles TEXT
        
    );
`;

class RoleSqliteRepository implements IRoleRepository{

    private db: any;

    constructor(DATABASE:string, verbose:boolean = false) {
        this.db = new sqlite(DATABASE, {verbose: verbose ? console.log : null});
    }

    table() {
        this.db.exec(roleTableSQL);
    }

    normalizeData(roleData: IRole){

        roleData.readonly = roleData.readonly ? 1 : 0

        if(roleData.permissions && Array.isArray(roleData.permissions)){
            roleData.permissions = roleData.permissions.join(",")
        }

        if(roleData.childRoles && Array.isArray(roleData.childRoles)){
            roleData.childRoles = roleData.childRoles.join(",")
        }
    }

    async create(roleData: IRole): Promise<IRole> {
        try{

            if(!roleData.id){
                roleData.id = randomUUID()
            }

            this.normalizeData(roleData)


            const fields = Object.keys(roleData)
                .map(field => `${field}`)
                .join(', ');

            const values = Object.keys(roleData)
                .map(field => `@${field}`)
                .join(', ');

           /* console.log("fields", fields)
            console.log("values",values)
            console.log("userData",roleData)*/

        const stmt = this.db.prepare(`INSERT INTO roles (${fields}) VALUES (${values})`);
        stmt.run(roleData)
        return this.findById(roleData.id as UUID)
        }catch (e){
            console.log(e)
            throw SqliteErrorToValidationError(e, roleData)
        }
    }

    async findById(id: UUID): Promise<IRole | null>{
        const role = this.db.prepare('SELECT * FROM roles WHERE id = ?').get(id);
        role.permissions = role.permissions ? role.permissions.split(",") : []
        return role
    }

    async update(id: UUID, roleData: IRole): Promise<IRole> {
        try{
            this.normalizeData(roleData)
            const setClauses = Object.keys(roleData)
                .map(field => `${field} = @${field}`)
                .join(', ');
            roleData.id = id
            const stmt = this.db.prepare( `UPDATE roles SET ${setClauses} WHERE id = @id `);
            stmt.run(roleData);
            return this.findById(id)
        }catch (e){
            console.log(e)
            throw SqliteErrorToValidationError(e, roleData)
        }

    }

    async delete(id: UUID): Promise<boolean> {
        const stmt = this.db.prepare('DELETE FROM roles WHERE id = ?');
        stmt.run(id);
        return true
    }

    async deleteAll(): Promise<boolean> {
        const stmt = this.db.prepare('DELETE FROM roles');
        stmt.run();
        return true
    }

    async fetchAll(): Promise<IRole[]>{
        const roles = this.db.prepare('SELECT * FROM roles').all();
        for (const role of roles) {
            role.permissions = role.permissions? role.permissions.split(",") : []
        }
        return roles
    }

    async paginate(page = 1, limit = 5): Promise<IPaginateResult>{
        const offset = (page - 1) * limit
        const rCount = this.db.prepare('SELECT COUNT(*) as count FROM roles').get();
        const roles = this.db.prepare('SELECT * FROM roles LIMIT ? OFFSET ?').all([limit, offset]);

        for (const role of roles) {
            role.permissions = role.permissions? role.permissions.split(",") : []
        }

        return {
            page: page,
            limit: limit,
            total: rCount.count,
            items: roles
        }
    }
}

export default RoleSqliteRepository
