import {describe, it, before, after} from "node:test"
import MongoInMemory from "../db/MongoInMemory";



describe("MockTest", function () {

    before(async () => {
        await MongoInMemory.connect()
        console.log("BEFORE MOCK", MongoInMemory.mongooseStatus, MongoInMemory.serverStatus)
        return
    })

    after(async () => {
        await MongoInMemory.DropAndClose()
        console.log("AFTER MOCK", MongoInMemory.status, MongoInMemory.serverStatus)
        return
    })


    it("should create MOCK", function () {
        console.log("should create mock")

    })
})
