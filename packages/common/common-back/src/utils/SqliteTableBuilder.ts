import sqlite from "better-sqlite3";

interface SqliteTableField {
    name: string,
    type: "NULL" | "INTEGER" | "REAL" | "TEXT" | "BLOB" | "NUMERIC",
    primary: boolean,
    unique: boolean,
    custom?: string,
}

const COLUMN_TYPES = ["NULL", "INTEGER", "REAL", "TEXT", "BLOB", "NUMERIC"]


class SqliteTableBuilder {
    private db: any;
    private tableName: string;
    private tableFields: SqliteTableField[];

    constructor(dataBaseFile: string, tableName: string, tableFields: SqliteTableField[], verbose: boolean = false) {

        if (!dataBaseFile) {
            throw new Error("dataBase is required")
        }

        if (!tableName) {
            throw new Error("tableName is required")
        }

        this.db = new sqlite(dataBaseFile, {verbose: verbose ? console.log : null});
        this.tableName = tableName
        this.tableFields = tableFields
    }


    build(identifier:string = 'id') {

        let createSql = `CREATE TABLE IF NOT EXISTS ${this.tableName} (${identifier} TEXT PRIMARY KEY)`
        this.db.exec(createSql);

        for (const field of this.tableFields) {
            if(!this.columnExist(field.name)){
                this.createColumn(field)
            }

        }
    }

    createColumn(field:SqliteTableField) {

        if(!field){
            throw new Error("field is required")
        }

        if(!COLUMN_TYPES.includes(field.type)){
            throw new Error(`Invalid column type ${field.type}`)
        }

        const updateSQL = `
                ALTER TABLE ${this.tableName}
                    ADD COLUMN ${field.name} ${field.type} ${field.primary ? "PRIMARY KEY" : ""} ${field.unique ? "UNIQUE" : ""} ${field.custom ? field.custom : ""}
            `;
        this.db.exec(updateSQL);
    }

    tableExist() {
        const tableExistSQL = `
            SELECT COUNT(*) AS ${this.tableName}
            FROM sqlite_master
            WHERE type = 'table'
              AND name = '${this.tableName}'
        `;

        let result = this.db.prepare(tableExistSQL).get();

        return !!result[this.tableName]
    }

    columnExist(columnName: string) {
        const columnExistSQL = `
            SELECT COUNT(*) AS ${columnName}
            FROM pragma_table_info('${this.tableName}')
            WHERE name = '${columnName}'
        `;

        let result = this.db.prepare(columnExistSQL).get();

        return !!result[columnName]
    }

}


export {SqliteTableBuilder}
export type {SqliteTableField}
