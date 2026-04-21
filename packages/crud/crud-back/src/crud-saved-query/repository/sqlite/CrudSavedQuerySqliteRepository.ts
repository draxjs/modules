import AbstractSqliteRepository from "../../../repository/AbstractSqliteRepository.js";
import type {ICrudSavedQueryRepository} from "../../interfaces/ICrudSavedQueryRepository";
import type {ICrudSavedQuery, ICrudSavedQueryBase} from "../../interfaces/ICrudSavedQuery";
import {SqliteTableField} from "@drax/common-back";

class CrudSavedQuerySqliteRepository
    extends AbstractSqliteRepository<ICrudSavedQuery, ICrudSavedQueryBase, ICrudSavedQueryBase>
    implements ICrudSavedQueryRepository {

    protected tableName: string = "CrudSavedQuery";
    protected searchFields: string[] = ["name", "entity"];
    protected booleanFields: string[] = ["shared"];
    protected jsonFields: string[] = ["columns", "staticFilters", "dynamicFilters"];
    protected identifier: string = "_id";
    protected populateFields = [
        {field: "tenant", table: "Tenant", identifier: "_id"},
        {field: "user", table: "User", identifier: "_id"}
    ];
    protected tableFields: SqliteTableField[] = [
        {name: "entity", type: "TEXT", unique: false, primary: false},
        {name: "name", type: "TEXT", unique: false, primary: false},
        {name: "shared", type: "INTEGER", unique: false, primary: false},
        {name: "columns", type: "TEXT", unique: false, primary: false},
        {name: "staticFilters", type: "TEXT", unique: false, primary: false},
        {name: "dynamicFilters", type: "TEXT", unique: false, primary: false},
        {name: "tenant", type: "TEXT", unique: false, primary: false},
        {name: "user", type: "TEXT", unique: false, primary: false},
        {name: "createdAt", type: "TEXT", unique: false, primary: false},
        {name: "updatedAt", type: "TEXT", unique: false, primary: false}
    ];
}

export default CrudSavedQuerySqliteRepository;
export {CrudSavedQuerySqliteRepository};
