import { mongoose } from '@drax/common-back';
const mongoConnect = async function () {
    if (!process.env.MONGO_URI) {
        console.error("MongoDB connection error: process.env.MONGO_URI not found");
        throw new Error("process.env.MONGO_URI not found");
    }
    const MONGO_URI = process.env.MONGO_URI;
    console.log("MONGO_URI", MONGO_URI);
    try {
        await connectToMongo(MONGO_URI);
        const db = mongoose.connection;
        db.on('error', function (error) {
            console.error('connection error:', error);
            console.info("Reconnecting with MongoDB");
            setTimeout(() => connectToMongo(MONGO_URI), 3000);
        });
        db.once('open', function () {
            console.info("MongoDB Open");
        });
    }
    catch (error) {
        console.error("Connection to Mongo error: ", error);
        throw error;
    }
};
const connectToMongo = function (mongoUri) {
    return new Promise((resolve, reject) => {
        mongoose.Promise = global.Promise;
        const options = {};
        mongoose.connect(mongoUri, options)
            .then(() => {
            console.info("Mongoose connected");
            resolve(true);
        })
            .catch(error => {
            console.error("Mongoose not connected", error);
            reject(error);
        });
    });
};
export default mongoConnect;
