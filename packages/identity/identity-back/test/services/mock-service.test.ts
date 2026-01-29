import {describe, it, beforeAll, afterAll} from "vitest"
import MongoInMemory from "../db/MongoInMemory";



describe("MockTest", function () {

    beforeAll(async () => {
        await MongoInMemory.connect()
        console.log("BEFORE MOCK", MongoInMemory.mongooseStatus, MongoInMemory.serverStatus)
        return
    })

    afterAll(async () => {
        await MongoInMemory.DropAndClose()
        console.log("AFTER MOCK", MongoInMemory.status, MongoInMemory.serverStatus)
        return
    })


    it("should create MOCK", function () {
        console.log("should create mock")

    })
})
