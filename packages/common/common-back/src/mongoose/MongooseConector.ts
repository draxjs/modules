import mongoose from 'mongoose'
import type {ConnectOptions} from 'mongoose'

class MongooseConector{
    private options: ConnectOptions;
    private reconnectionTime: number;
    private mongoUri: string;


    constructor(mongoUri:string, options: ConnectOptions = {}, reconnectionTime:number= 5000) {
        this.setMongoUri(mongoUri)
        this.setOptions(options)
        this.setReconnectionTime(reconnectionTime)
        this.handleOpen()
        this.handleError()
        this.handleDisconnected()
    }

    get getOptions(): ConnectOptions {
        return this.options
    }

    setOptions(options: ConnectOptions) {
        this.options = options
    }

    get getReconnectionTime(): number {
        return this.reconnectionTime > 0 ? this.reconnectionTime : 5000
    }

    setReconnectionTime(reconnectionTime: number) {
        //Validate is a number and greater than 0
        if (typeof reconnectionTime === 'number' && reconnectionTime > 0) {
            this.reconnectionTime = reconnectionTime;
        } else {
            throw new Error("MongooseConector: reconnectionTime must be a number and greater than 0");
        }
    }

    get getMongoUri(){
        return this.mongoUri
    }

    setMongoUri(mongoUri: string) {
        const regex = /^(mongodb(?:\+srv)?):\/\/(?:([^:]+):([^@]+)@)?([a-zA-Z0-9.-]+)(?::(\d+))?(?:\/([a-zA-Z0-9_-]+))?(?:\?(.+))?$/;
        if (regex.test(mongoUri)) {
            this.mongoUri = mongoUri;
        } else {
            throw new Error("MongooseConector: Invalid MongoDB URI");
        }
    }

    get hasMongoUri(){
        return !!this.mongoUri
    }

    handleOpen(){
        mongoose.connection.on('open', (event) => {
            console.info('MongooseConector: mongoose connection event open.')
        })
    }

    handleError(){
        mongoose.connection.on('error', (event) => {
            console.warn('MongooseConector: mongoose connection error.',event)
            setTimeout(() => this.connect(), this.getReconnectionTime)
        })
    }

    handleDisconnected(){
        mongoose.connection.on('disconnected', (event) => {
            console.warn('MongooseConector: mongoose connection disconnected.',event)
            setTimeout(() => this.connect(), this.getReconnectionTime)
        })
    }


    async connect(){
        if(!this.hasMongoUri){
            throw new Error("MongooseConector: MONGO_URI not found")
        }

        try {
            await mongoose.connect(this.getMongoUri, this.getOptions)
        } catch (error) {
            console.error("MongooseConector: connect error", error)
           setTimeout(this.connect,this.getReconnectionTime)
        }

    }

    async disconnect(){
        await mongoose.disconnect()
    }

}


export default MongooseConector
export {MongooseConector}
