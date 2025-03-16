import {describe, it, beforeAll, afterAll, expect} from "vitest"
import MongoInMemory from "../db/MongoInMemory";
import TenantRoute from "../../src/routes/TenantRoutes";
process.env.DRAX_DB_ENGINE="mongo"
import TenantServiceFactory from "../../src/factory/TenantServiceFactory";
import {FastifyTestServerFactory} from './FastifyTestServerFactory'



describe("Tenant Route Test", function () {

    let FastifyTestServer = FastifyTestServerFactory()


    beforeAll(async () => {
        await MongoInMemory.connect()
        console.log("BEFORE MOCK", MongoInMemory.mongooseStatus, MongoInMemory.serverStatus)
        const tenantService = TenantServiceFactory()
        await tenantService.create({name: "TestTenant"})
        FastifyTestServer.register(TenantRoute)

        return
    })

    afterAll(async () => {
        await MongoInMemory.DropAndClose()
        console.log("AFTER MOCK", MongoInMemory.status, MongoInMemory.serverStatus)
        return
    })


    it("should create MOCK", async  () => {
        const resp = await FastifyTestServer.inject({
            method: 'GET',
            url: '/api/tenants',

        })
        console.log("resp", resp.statusCode)
        console.log("resp", resp.body)

        expect(resp.statusCode).toBe(200)
        expect(resp.body)



    })
})
