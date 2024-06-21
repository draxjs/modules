import IdentityConfig from "../config/IdentityConfig.js";
import {DraxConfig} from "@drax/common-back";

enum DbEngine{
    Sqlite = "sqlite",
    Mongo = "mongo",
}


class DbSetupUtils{


    static getDbEngine() {
        if (!DraxConfig.getOrLoad(IdentityConfig.DbEngine)) {
            throw new Error("DraxConfig.DB_ENGINE is not defined");
        }
        const dbEngine = DraxConfig.getOrLoad(IdentityConfig.DbEngine) as DbEngine;
        if (!Object.values(DbEngine).includes(dbEngine)) {
            throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(DbEngine).join(", "));
        }
        return dbEngine;
    }

    static getDbConfig(){
        switch (DbSetupUtils.getDbEngine()) {
            case DbEngine.Mongo:
                return DraxConfig.getOrLoad(IdentityConfig.MongoDbUri);
            case DbEngine.Sqlite:
                return DraxConfig.getOrLoad(IdentityConfig.SqliteDbFile);
            default:
                throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(DbEngine).join(", "));
        }
    }

}


export {
    DbEngine,
    DbSetupUtils
}
