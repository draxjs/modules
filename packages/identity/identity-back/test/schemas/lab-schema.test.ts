import {describe, it, beforeAll, afterAll} from "vitest"
import {MongooseConector} from "@drax/common-back";
import {UserSchema} from "../../src/schemas/UserSchema";
import { zodToJsonSchema } from 'zod-to-json-schema';
import TenantServiceFactory from "../../src/factory/TenantServiceFactory";
import UserServiceFactory from "../../src/factory/UserServiceFactory";
import fastJson from "fast-json-stringify"
import z from "zod"
import {TenantModel, TenantMongoSchema} from "../../src/models/TenantModel";

process.env.DRAX_DB_ENGINE = "mongo"
let mongooseUri = "mongodb://127.0.0.1:27017/drax"
const mongooseConector = new MongooseConector(mongooseUri)

const tenantService = TenantServiceFactory()
const userService = UserServiceFactory()

describe("Test Schema", function () {

    beforeAll(async () => {

        await mongooseConector.connect()
        return
    })

    afterAll(async () => {
        await mongooseConector.disconnect()
    })

    it("Lab Schema", async () => {

        const zSchema = z.object({
            name: z.string(),
            tenant: z.object({
                _id: z.string(),
                name: z.string()
            }).optional().nullable()
        })

        let jsonSchema = zodToJsonSchema(zSchema,{target:'openapi-3.0'})
        console.log("jsonUserSchema", JSON.stringify(jsonSchema, null,4))

        let row1 = {
            name: "mock-tenant",
            lastname:"mock-lastname",
            tenant: {
                _id: "667618bfcd0dd6f880b90d82",
                name: "mock-tenant"
            }
        }

        let row2 = {
            name: "mock-tenant",
            lastname:"mock-lastname",
            tenant: {
                _id: "667618bfcd0dd6f880b90d82",
                name: "mock-tenant",
                createdAt: new Date(),
                updatedAt: new Date()
            }
        }

        let row3 = {
            name: "mock-tenant",
            lastname:"mock-lastname",
            tenant: null
        }

        let row4 = {
            name: "mock-tenant",
            lastname:"mock-lastname",
        }



        //@ts-ignore
        const stringify =  fastJson(jsonSchema  )

         const r1 = stringify(row1)
         console.log("r1",r1)
        const r2 = stringify(row2)
        console.log("r2",r2)
        const r3 = stringify(row3)
        console.log("r3",r3)
        const r4 = stringify(row4)
        console.log("r4",r4)

    })


    it("should create MOCK", async () => {
        console.log("should create mock")

        let jsonUserSchema = zodToJsonSchema(UserSchema)
        console.log("jsonUserSchema", JSON.stringify(jsonUserSchema, null,4))




        let user = await userService.search('667618bfcd0dd6f880b90d82')
        console.log("user",user)

        //@ts-ignore
        const stringify = fastJson(jsonUserSchema)
        let ruser = stringify(user[0])

        console.log("ruser",ruser)

    })
})
