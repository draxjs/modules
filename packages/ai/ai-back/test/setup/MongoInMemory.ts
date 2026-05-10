import {mongoose} from '@drax/common-back';
import {MongoMemoryServer} from 'mongodb-memory-server';

class MongoInMemory {

    mongoServer: MongoMemoryServer

    async connect() {
        this.mongoServer = await MongoMemoryServer.create();
        if (this.mongoServer.state == "new") {
            await this.mongoServer.start()
        }
        if (!mongoose.connection.readyState) {
            await mongoose.connect(this.mongoServer.getUri(), {dbName: "verifyMASTER"});
        }
        return
    }

    get mongooseStatus() {
        return mongoose.connection.readyState
    }

    get serverStatus() {
        return this.mongoServer.state
    }

    get status() {
        return mongoose.connection.readyState
    }

    async disconnect() {
        await mongoose.disconnect();
    }

    async dropData() {
        const collections = await mongoose.connection.listCollections()
        for (let collection of collections) {
            console.log(`Dropping collection: ${collection.name}`)
            await mongoose.connection.dropCollection(collection.name)
        }

    }

    async dropAndClose() {
        if (this.mongoServer) {
            await mongoose.connection.dropDatabase();
            await mongoose.connection.close();
            await this.mongoServer.stop();
        }
    }
}

export default MongoInMemory
