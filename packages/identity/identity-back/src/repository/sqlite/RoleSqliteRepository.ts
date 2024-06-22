import {IRole} from '../../interfaces/IRole'
import {IRoleRepository} from '../../interfaces/IRoleRepository'
import {UUID} from "crypto";
import sqlite from "better-sqlite3";
import {randomUUID} from "node:crypto";
import {IPaginateFilter, IPaginateResult, ValidationError} from "@drax/common-back";
import {SqliteErrorToValidationError} from "@drax/common-back";
import {IID} from "../../interfaces/IID";

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
        this.table()
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

    async findById(id: IID): Promise<IRole | null>{
        const role = this.db.prepare('SELECT * FROM roles WHERE id = ?').get(id);
        if(role){
            await this.populateRole(role)
            return role
        }
        return undefined
    }

    async findByName(name: string): Promise<IRole | null>{
        const role = this.db.prepare('SELECT * FROM roles WHERE name = ?').get(name);
        if(role){
            await this.populateRole(role)
            return role
        }
        return undefined
    }

    async update(id: IID, roleData: IRole): Promise<IRole> {
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

    async delete(id: IID): Promise<boolean> {
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
            await this.populateRole(role)
        }
        return roles
    }

    async paginate(page = 1, limit = 5, search=""): Promise<IPaginateResult>{
        const offset = page > 1 ? (page - 1) * limit : 0

        let where=""
        if (search) {
            where = ` WHERE name LIKE '%${search}%'`
        }

        const rCount = this.db.prepare('SELECT COUNT(*) as count FROM roles'+where).get();
        const roles = this.db.prepare('SELECT * FROM roles LIMIT ? OFFSET ?'+where).all([limit, offset]);

        for (const role of roles) {
            await this.populateRole(role)
        }

        return {
            page: page,
            limit: limit,
            total: rCount.count,
            items: roles
        }
    }

    async findWithoutPopulateById(id: IID): Promise<IRole | null>{
        const role = this.db.prepare('SELECT * FROM roles WHERE id = ?').get(id);
        if(role){
            return role
        }
        return undefined
    }

    async populateRole(role){
        role.permissions = role.permissions? role.permissions.split(",") : []
        role.childRoles = role.childRoles? role.childRoles.split(",") : []

        const childRoles = []
        for(const childRoleId of role.childRoles){
            const childRole:IRole = await this.findWithoutPopulateById(childRoleId)
            childRoles.push(childRole)
        }
        role.childRoles = childRoles
        return role
    }


}

export default RoleSqliteRepository
