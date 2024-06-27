import {IdentityConfig, RecoveryUserPassword} from "@drax/identity-back";
import {DraxConfig} from "@drax/common-back";
import MongoDb from '../databases/MongoDB.js'
import rootUser from "../setup/data/users/root-user";

if(DraxConfig.get(IdentityConfig.DbEngine) === 'mongo'){
    MongoDb()
}

await RecoveryUserPassword(rootUser.username,rootUser.password)

process.exit(0)
