import {ISettingRepository} from '../../interfaces/ISettingRepository'
import {ISetting, ISettingBase} from "@drax/settings-share";
import {
    SqliteTableField,
} from "@drax/common-back";
import {AbstractSqliteRepository} from "@drax/crud-back";


class SettingSqliteRepository extends AbstractSqliteRepository<ISetting,ISettingBase, ISettingBase> implements ISettingRepository{

    protected db: any;
    protected tableName: string = 'settings';
    protected dataBaseFile: string;
    protected searchFields: string[] = [];
    protected booleanFields: string[] = ['public'];
    protected identifier: string = '_id';
    protected populateFields = []
    protected tableFields: SqliteTableField[] = [
        {name: "key", type: "TEXT", unique: true, primary: false},
        {name: "value", type: "TEXT", unique: false, primary: false},
        {name: "label", type: "TEXT", unique: false, primary: false},
        {name: "category", type: "TEXT", unique: false, primary: false},
        {name: "type", type: "TEXT", unique: false, primary: false},
        {name: "options", type: "TEXT", unique: false, primary: false},
        {name: "regex", type: "TEXT", unique: false, primary: false},
        {name: "entity", type: "TEXT", unique: false, primary: false},
        {name: "entityValue", type: "TEXT", unique: false, primary: false},
        {name: "entityText", type: "TEXT", unique: false, primary: false},
        {name: "prefix", type: "TEXT", unique: false, primary: false},
        {name: "suffix", type: "TEXT", unique: false, primary: false},
        {name: "description", type: "TEXT", unique: false, primary: false},
        {name: "public", type: "TEXT", unique: false, primary: false},
        {name: "permission", type: "TEXT", unique: false, primary: false},
        {name: "updatedBy", type: "TEXT", unique: false, primary: false},
    ]
    protected verbose: boolean = false;


    async updatePartial(id: string, data: any) {
        let item = await this.findById(id)
        if(!item){
            throw new Error('Setting not found')
        }
        data = {...item,...data}
        return await this.update(id, data)
    }

    async prepareData(data: any){
        if(data && data.options){
            data.options = JSON.stringify(data.options)
        }
        if(data.type === 'boolean'){
            data.value = data.value ? 1 : 0
        }
        if(data.type === 'stringList'){
            data.value = data.value && Array.isArray(data.value) ? data.value.join(',') : data.value
        }
        if(data.type === 'numberList'){
            data.value = data.value && Array.isArray(data.value) ? data.value.join(',') : data.value
        }
        if(data.type === 'enumList'){
            data.value = data.value && Array.isArray(data.value) ? data.value.join(',') : data.value
        }
        if(data.type === 'ref'){

        }
        if(data.type === 'secret'){

        }
    }

    async prepareItem(item: any){

        if(!item){
            return
        }

        if(item && item.options){
           item.options = JSON.parse(item.options)
        }
        if(item.type === 'boolean'){
            item.value = item.value === 1 || item.value === '1' || item.value === '1.0'
        }
        if(item.type === 'stringList'){
            item.value = item.value ? item.value.split(',') : []
        }
        if(item.type === 'numberList'){
            item.value = item.value ? item.value.split(',') : []
        }
        if(item.type === 'enumList'){
            item.value = item.value ? item.value.split(',') : []
        }
        if(item.type === 'ref'){

        }
        if(item.type === 'secret'){

        }

    }

    async findByKey(key: string): Promise<ISetting | null>{
        const setting = this.db.prepare('SELECT * FROM settings WHERE key = ?').get(key);
        if(setting){
            return setting
        }
        return undefined
    }


}

export default SettingSqliteRepository
export {SettingSqliteRepository}
