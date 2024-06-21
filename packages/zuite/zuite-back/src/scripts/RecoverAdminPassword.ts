import RecoveryUserPassword from "../utils/RecoveryUserPassword.js";
import MongoDb from '../databases/MongoDB.js'

if(process.env.DB_ENGINE === 'mongo'){
    MongoDb()
}

await RecoveryUserPassword('admin','123')
