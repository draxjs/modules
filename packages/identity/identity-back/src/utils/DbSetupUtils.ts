
enum DbEngine{
    Sqlite = "sqlite",
    Mongo = "mongo",
}


class DbSetupUtils{


    static getDbEngine() {
        if (!process.env.DB_ENGINE) {
            throw new Error("process.env.DB_ENGINE is not defined");
        }
        const dbEngine = process.env.DB_ENGINE as DbEngine;
        if (!Object.values(DbEngine).includes(dbEngine)) {
            throw new Error("process.env.DB_ENGINE must be one of " + Object.values(DbEngine).join(", "));
        }
        return dbEngine;
    }

    static getDbUri(){
        switch (DbSetupUtils.getDbEngine()) {
            case DbEngine.Mongo:
                return process.env.MONGO_URI;
            case DbEngine.Sqlite:
                return process.env.SQLITE_DATABASE;
            default:
                throw new Error("process.env.DB_ENGINE must be one of " + Object.values(DbEngine).join(", "));
        }
    }

}


export {
    DbEngine,
    DbSetupUtils
}
