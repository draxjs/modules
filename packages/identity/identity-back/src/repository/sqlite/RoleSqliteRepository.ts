import {IRoleRepository} from '../../interfaces/IRoleRepository'
import {UUID} from "crypto";
import sqlite from "better-sqlite3";
import {randomUUID} from "node:crypto";
import {IDraxPaginateResult, IDraxPaginateOptions} from "@drax/common-share";
import {IRole, IRoleBase} from "@drax/identity-share";
import {
    SqliteErrorToValidationError,
    SqliteTableBuilder,
    SqliteTableField,
    SqlQueryFilter,
    SqlSort
} from "@drax/common-back";

const tableFields: SqliteTableField[] = [
    {name: "name", type: "TEXT", unique: true, primary: false},
    {name: "permissions", type: "TEXT", unique: false, primary: false},
    {name: "childRoles", type: "TEXT", unique: false, primary: false},
    {name: "readonly", type: "INTEGER", unique: false, primary: false},
    {name: "createdAt", type: "TEXT", unique: false, primary: false},
    {name: "updatedAt", type: "TEXT", unique: false, primary: false},
]


class RoleSqliteRepository implements IRoleRepository{

    private db: any;
    private dataBaseFile: string;

    constructor(dataBaseFile:string, verbose:boolean = false) {
        this.dataBaseFile = dataBaseFile;
        this.db = new sqlite(dataBaseFile, {verbose: verbose ? console.log : null});
        this.table()
    }

    table() {
        const builder = new SqliteTableBuilder(
            this.dataBaseFile,
            'roles',
            tableFields,
            false);
        builder.build('id')
    }

    normalizeData(roleData: IRoleBase){

        roleData.readonly = roleData.readonly ? 1 : 0

        if(roleData.permissions && Array.isArray(roleData.permissions)){
            roleData.permissions = roleData.permissions.join(",")
        }

        if(roleData.childRoles && Array.isArray(roleData.childRoles)){
            roleData.childRoles = roleData.childRoles.join(",")
        }
    }

    async create(roleData: IRoleBase): Promise<IRole> {
        try{

            if(!roleData.id){
                roleData.id = randomUUID()
            }

            this.normalizeData(roleData)
            roleData.createdAt = (new Date().toISOString())

            const fields = Object.keys(roleData)
                .map(field => `${field}`)
                .join(', ');

            const values = Object.keys(roleData)
                .map(field => `@${field}`)
                .join(', ');


        const stmt = this.db.prepare(`INSERT INTO roles (${fields}) VALUES (${values})`);
        stmt.run(roleData)
        return this.findById(roleData.id as UUID)
        }catch (e){
            console.log(e)
            throw SqliteErrorToValidationError(e, roleData)
        }
    }



    async update(id: string, roleData: IRoleBase): Promise<IRole> {
        try{
            this.normalizeData(roleData)
            roleData.updatedAt = (new Date().toISOString())

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

    async paginate({
                       page= 1,
                       limit= 5,
                       orderBy= '',
                       order= false,
                       search= '',
                       filters= []} : IDraxPaginateOptions): Promise<IDraxPaginateResult<IRole>>{
        const offset = page > 1 ? (page - 1) * limit : 0

        let where=""
        if (search) {
            where = ` WHERE name LIKE '%${search}%'`
        }

        where = SqlQueryFilter.applyFilters(where, filters)
        const sort = SqlSort.applySort(orderBy, order)

        const rCount = this.db.prepare('SELECT COUNT(*) as count FROM roles'+where).get();
        where += sort
        const roles = this.db.prepare('SELECT * FROM roles '  + where + ' LIMIT ? OFFSET ?').all([limit, offset]);

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

    async delete(id: string): Promise<boolean> {
        const stmt = this.db.prepare('DELETE FROM roles WHERE id = ?');
        stmt.run(id);
        return true
    }

    async deleteAll(): Promise<boolean> {
        const stmt = this.db.prepare('DELETE FROM roles');
        stmt.run();
        return true
    }

    async findById(id: string): Promise<IRole | null>{
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

    async fetchAll(): Promise<IRole[]>{
        const roles = this.db.prepare('SELECT * FROM roles').all();
        for (const role of roles) {
            await this.populateRole(role)
        }
        return roles
    }



    async findWithoutPopulateById(id: string): Promise<IRole | null>{
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
