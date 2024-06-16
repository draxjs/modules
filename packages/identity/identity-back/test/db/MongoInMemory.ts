import {mongoose} from '@drax/common-back';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer

class MongoInMemory{

    static async connect(){
        mongoServer = await MongoMemoryServer.create();
        if(mongoServer.state == "new"){
            await mongoServer.start()
        }
        if(!mongoose.connection.readyState){
            await mongoose.connect(mongoServer.getUri(), { dbName: "verifyMASTER" });
        }
        return
    }
    static get mongooseStatus(){
        return mongoose.connection.readyState
    }

    static get serverStatus(){
        return mongoServer.state
    }

    static get status(){
        return mongoose.connection.readyState
    }

    static async disconnect(){
        await mongoose.disconnect();
    }

    static async DropAndClose(){
        if (mongoServer) {
            await mongoose.connection.dropDatabase();
            await mongoose.connection.close();
            await mongoServer.stop();
        }
    }
}

export default MongoInMemory
