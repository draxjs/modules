import {IRoleRepository} from '../../interfaces/IRoleRepository'
import {IRole, IRoleBase} from "@drax/identity-share";
import {AbstractSqliteRepository} from "@drax/crud-back";
import {
    SqliteTableField,
} from "@drax/common-back";



class RoleSqliteRepository extends AbstractSqliteRepository<IRole, IRoleBase, IRoleBase> implements IRoleRepository{

    protected db: any;
    protected tableName: string = 'roles';
    protected dataBaseFile: string;
    protected searchFields: string[] = [];
    protected booleanFields: string[] = [];
    protected identifier: string = '_id';
    protected populateFields = []
    protected tableFields: SqliteTableField[] = [
        {name: "name", type: "TEXT", unique: true, primary: false},
        {name: "permissions", type: "TEXT", unique: false, primary: false},
        {name: "childRoles", type: "TEXT", unique: false, primary: false},
        {name: "readonly", type: "INTEGER", unique: false, primary: false},
        {name: "createdAt", type: "TEXT", unique: false, primary: false},
        {name: "updatedAt", type: "TEXT", unique: false, primary: false},
    ]
    protected verbose: boolean;

    constructor(dataBaseFile: string, verbose: boolean = false) {
        super(dataBaseFile, verbose);
        this.tableName = 'roles'
    }


    async prepareData(roleData: any){

        roleData.readonly = roleData.readonly ? 1 : 0

        if(roleData.permissions && Array.isArray(roleData.permissions)){
            roleData.permissions = roleData.permissions.join(",")
        }

        if(roleData.childRoles && Array.isArray(roleData.childRoles)){
            roleData.childRoles = roleData.childRoles.join(",")
        }
    }

    async prepareItem(role: any): Promise<IRole>{
        if(role){

            role.permissions = role && role.permissions ? role.permissions.split(",") : []

            role.childRoles = role && role.childRoles ? role.childRoles.split(",") : []

            const childRoles = []
            for(const childRoleId of role.childRoles){
                const childRole:IRole = await this.findWithoutPopulateById(childRoleId)
                childRoles.push(childRole)
            }
            role.childRoles = childRoles
            return role
        }

    }



    async findByName(name: string): Promise<IRole | null>{
        const role = this.db.prepare('SELECT * FROM roles WHERE name = ?').get(name);
        if(role){
            await this.decorate(role)
            return role
        }
        return undefined
    }



    async findWithoutPopulateById(id: string): Promise<IRole | null>{
        const role = this.db.prepare(`SELECT * FROM roles WHERE ${this.identifier} = ?`).get(id);
        if(role){
            return role
        }
        return undefined
    }




}

export default RoleSqliteRepository
