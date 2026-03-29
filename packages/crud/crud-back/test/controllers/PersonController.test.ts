import { describe, it, beforeAll, afterAll, afterEach, expect, vi } from "vitest"
import { PersonFastifyRoutes } from '../people/routes/PersonRoutes'
import { PersonPermissions } from '../people/permissions/PersonPermissions'
import { PersonController } from '../people/controllers/PersonController.js'

import type { IPersonBase } from '../people/interfaces/IPerson'

import {LanguageModel, LanguageSchema} from "../people/models/LanguageModel.js"
import {CountryModel, CountrySchema} from "../people/models/CountryModel.js"
import {PersonModel, PersonSchema} from "../people/models/PersonModel.js"

import TestSetup from "../setup/TestSetup"

describe("Person Controller Test", function () {

    console.log(LanguageSchema)
    console.log(CountrySchema)
    console.log(PersonSchema)

    let testSetup = new TestSetup({
        routes: [PersonFastifyRoutes],
        permissions: [PersonPermissions]
    })

    const defaultAddress = { street: "Main St" }

    beforeAll(async () => {
        await testSetup.setup()
    })

    afterAll(async () => {
        await testSetup.dropAndClose()
        return
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    // Test users are logged in and get their details +
    it("Me Admin Root", async () => {
        const { accessToken } = await testSetup.rootUserLogin()
        expect(accessToken).toBeTruthy()
        const resp = await testSetup.fastifyInstance.inject({
            method: 'get',
            url: '/api/auth/me',
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        const body = resp.json()
        expect(body.username).toBe(testSetup.rootUserData.username)
    })

    it("Me Tenant One", async () => {
        const { accessToken } = await testSetup.tenantOneUserLogin()
        expect(accessToken).toBeTruthy()
        const resp = await testSetup.fastifyInstance.inject({
            method: 'get',
            url: '/api/auth/me',
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        const body = resp.json()
        expect(body.username).toBe(testSetup.tenantOneUserData.username)
    })

    it("Me Tenant Two", async () => {
        const { accessToken } = await testSetup.tenantTwoUserLogin()
        expect(accessToken).toBeTruthy()
        const resp = await testSetup.fastifyInstance.inject({
            method: 'get',
            url: '/api/auth/me',
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        const body = resp.json()
        expect(body.username).toBe(testSetup.tenantTwoUserData.username)
    })

    // 1. Create and Find by ID
    it("should create a new person and find by id", async () => {
        const { accessToken } = await testSetup.rootUserLogin()
        expect(accessToken).toBeTruthy()
        await testSetup.dropCollection('Person')

        const newPerson: IPersonBase = {
            fullname: "Test Person",
            money: 100,
            address: defaultAddress
        }

        const resp = await testSetup.fastifyInstance.inject({
            method: 'POST',
            url: '/api/person',
            payload: newPerson,
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        const person = await resp.json()
        if (resp.statusCode !== 200) throw new Error("POST ERROR: " + JSON.stringify(person))
        expect(resp.statusCode).toBe(200)
        expect(person.fullname).toBe("Test Person")
        expect(person._id).toBeDefined()

        const getResp = await testSetup.fastifyInstance.inject({
            method: 'GET',
            url: '/api/person/' + person._id,
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        const getEntity = await getResp.json()
        expect(getResp.statusCode).toBe(200)
        expect(getEntity.fullname).toBe("Test Person")
    })

    it("should run postCreate interceptor after creating a person", async () => {
        const { accessToken } = await testSetup.rootUserLogin()
        await testSetup.dropCollection('Person')

        const postCreateSpy = vi
            .spyOn(PersonController.prototype, 'postCreate')
            .mockImplementation(async (_request, item) => ({
                ...item,
                fullname: `${item.fullname} [postCreate]`
            }))

        const resp = await testSetup.fastifyInstance.inject({
            method: 'POST',
            url: '/api/person',
            payload: {
                fullname: "Create Hook",
                money: 100,
                address: defaultAddress
            },
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        const person = await resp.json()
        expect(resp.statusCode).toBe(200)
        expect(postCreateSpy).toHaveBeenCalledTimes(1)
        expect(person.fullname).toBe("Create Hook [postCreate]")
    })

    // 2. Create and Update (Full Update - PUT)
    it("should create and update a person and finally find by id", async () => {
        const { accessToken } = await testSetup.rootUserLogin()
        await testSetup.dropCollection('Person')

        const newPerson: IPersonBase = {
            fullname: "Update Test",
            money: 50,
            address: defaultAddress
        }

        const resp = await testSetup.fastifyInstance.inject({
            method: 'POST',
            url: '/api/person',
            payload: newPerson,
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        const entity = await resp.json()
        expect(resp.statusCode).toBe(200)

        const updateData: IPersonBase = {
            fullname: "Updated Person",
            money: 150,
            address: defaultAddress
        }

        const updateResp = await testSetup.fastifyInstance.inject({
            method: 'PUT',
            url: `/api/person/${entity._id}`,
            payload: updateData,
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        expect(updateResp.statusCode).toBe(200)

        const verifyResp = await testSetup.fastifyInstance.inject({
            method: 'GET',
            url: `/api/person/${entity._id}`,
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        const verifiedEntity = await verifyResp.json()
        expect(verifiedEntity.fullname).toBe("Updated Person")
        expect(verifiedEntity.money).toBe(150)
    })

    it("should run postUpdate interceptor after updating a person", async () => {
        const { accessToken } = await testSetup.rootUserLogin()
        await testSetup.dropCollection('Person')

        const createResp = await testSetup.fastifyInstance.inject({
            method: 'POST',
            url: '/api/person',
            payload: {
                fullname: "Update Hook",
                money: 100,
                address: defaultAddress
            },
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        const createdEntity = await createResp.json()

        const postUpdateSpy = vi
            .spyOn(PersonController.prototype, 'postUpdate')
            .mockImplementation(async (_request, item) => ({
                ...item,
                fullname: `${item.fullname} [postUpdate]`
            }))

        const updateResp = await testSetup.fastifyInstance.inject({
            method: 'PUT',
            url: `/api/person/${createdEntity._id}`,
            payload: {
                fullname: "Updated Hook",
                money: 250,
                address: defaultAddress
            },
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        const updatedEntity = await updateResp.json()
        expect(updateResp.statusCode).toBe(200)
        expect(postUpdateSpy).toHaveBeenCalledTimes(1)
        expect(updatedEntity.fullname).toBe("Updated Hook [postUpdate]")
    })

    // 3. Create and Partial Update (PATCH)
    it("should create and update partial a person and finally find by id", async () => {
        const { accessToken } = await testSetup.rootUserLogin()
        await testSetup.dropCollection('Person')

        const newPerson: IPersonBase = {
            fullname: "Patch Test",
            money: 120,
            address: defaultAddress
        }

        const resp = await testSetup.fastifyInstance.inject({
            method: 'POST',
            url: '/api/person',
            payload: newPerson,
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        const entity = await resp.json()

        const updateResp = await testSetup.fastifyInstance.inject({
            method: 'PATCH',
            url: `/api/person/${entity._id}`,
            payload: { fullname: "Patched Person" },
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        expect(updateResp.statusCode).toBe(200)

        const verifyResp = await testSetup.fastifyInstance.inject({
            method: 'GET',
            url: `/api/person/${entity._id}`,
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        const verifiedEntity = await verifyResp.json()
        expect(verifiedEntity.fullname).toBe("Patched Person")
        expect(verifiedEntity.money).toBe(120)
    })

    it("should run postUpdatePartial interceptor after patching a person", async () => {
        const { accessToken } = await testSetup.rootUserLogin()
        await testSetup.dropCollection('Person')

        const createResp = await testSetup.fastifyInstance.inject({
            method: 'POST',
            url: '/api/person',
            payload: {
                fullname: "Patch Hook",
                money: 120,
                address: defaultAddress
            },
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        const createdEntity = await createResp.json()

        const postUpdatePartialSpy = vi
            .spyOn(PersonController.prototype, 'postUpdatePartial')
            .mockImplementation(async (_request, item) => ({
                ...item,
                fullname: `${item.fullname} [postUpdatePartial]`
            }))

        const patchResp = await testSetup.fastifyInstance.inject({
            method: 'PATCH',
            url: `/api/person/${createdEntity._id}`,
            payload: { fullname: "Patched Hook" },
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        const patchedEntity = await patchResp.json()
        expect(patchResp.statusCode).toBe(200)
        expect(postUpdatePartialSpy).toHaveBeenCalledTimes(1)
        expect(patchedEntity.fullname).toBe("Patched Hook [postUpdatePartial]")
    })

    it("should run postRead interceptor when reading a person", async () => {
        const { accessToken } = await testSetup.rootUserLogin()
        await testSetup.dropCollection('Person')

        const createResp = await testSetup.fastifyInstance.inject({
            method: 'POST',
            url: '/api/person',
            payload: {
                fullname: "Read Hook",
                money: 80,
                address: defaultAddress
            },
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        const createdEntity = await createResp.json()

        const postReadSpy = vi
            .spyOn(PersonController.prototype, 'postRead')
            .mockImplementation(async (_request, item) => ({
                ...item,
                fullname: `${item.fullname} [postRead]`
            }))

        const getResp = await testSetup.fastifyInstance.inject({
            method: 'GET',
            url: `/api/person/${createdEntity._id}`,
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        const person = await getResp.json()
        expect(getResp.statusCode).toBe(200)
        expect(postReadSpy).toHaveBeenCalledTimes(1)
        expect(person.fullname).toBe("Read Hook [postRead]")
    })

    // 4. Create and Delete
    it("should create and delete a person", async () => {
        const { accessToken } = await testSetup.rootUserLogin()
        await testSetup.dropCollection('Person')

        const newPerson: IPersonBase = { fullname: "Delete Me", address: defaultAddress }

        const createResp = await testSetup.fastifyInstance.inject({
            method: 'POST',
            url: '/api/person',
            payload: newPerson,
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        const createdEntity = await createResp.json()
        const entityId = createdEntity._id

        const deleteResp = await testSetup.fastifyInstance.inject({
            method: 'DELETE',
            url: `/api/person/${entityId}`,
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        expect(deleteResp.statusCode).toBe(200)

        const verifyResp = await testSetup.fastifyInstance.inject({
            method: 'GET',
            url: `/api/person/${entityId}`,
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        expect(verifyResp.statusCode).toBe(404)
    })

    // 5. Create and Paginate
    it("Should create and paginate people", async () => {
        const { accessToken } = await testSetup.rootUserLogin()
        await testSetup.dropCollection('Person')

        const entityData = [
            { fullname: "Person 1", address: defaultAddress },
            { fullname: "Person 2", address: defaultAddress }
        ]

        for (const data of entityData) {
            await testSetup.fastifyInstance.inject({
                method: 'POST',
                url: '/api/person',
                payload: data,
                headers: { Authorization: `Bearer ${accessToken}` }
            })
        }

        const resp = await testSetup.fastifyInstance.inject({
            method: 'GET',
            url: '/api/person',
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        const result = await resp.json()
        expect(resp.statusCode).toBe(200)
        expect(result.items.length).toBe(2)
        expect(result.total).toBe(2)
    })

    // 6. Create and Search
    it("should create and search for people", async () => {
        const { accessToken } = await testSetup.rootUserLogin()
        await testSetup.dropCollection('Person')

        const entityData = [
            { fullname: "Searchable Alice", address: defaultAddress },
            { fullname: "Searchable Bob", address: defaultAddress },
            { fullname: "Hidden Charlie", address: defaultAddress }
        ]

        for (const data of entityData) {
            await testSetup.fastifyInstance.inject({
                method: 'POST',
                url: '/api/person',
                payload: data,
                headers: { Authorization: `Bearer ${accessToken}` }
            })
        }

        const searchResp = await testSetup.fastifyInstance.inject({
            method: 'GET',
            url: '/api/person/search?search=Searchable',
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        const searchResult = await searchResp.json()
        expect(searchResp.statusCode).toBe(200)
        expect(searchResult.length).toBe(2)
    })

    // 7. Create and Find with Filters
    it("should create and find people with filters", async () => {
        const { accessToken } = await testSetup.rootUserLogin()
        await testSetup.dropCollection('Person')

        const entityData = [
            { fullname: "Active Person", live: true, address: defaultAddress },
            { fullname: "Inactive Person", live: false, address: defaultAddress }
        ]

        for (const data of entityData) {
            await testSetup.fastifyInstance.inject({
                method: 'POST',
                url: '/api/person',
                payload: data,
                headers: { Authorization: `Bearer ${accessToken}` }
            })
        }

        const findByResp = await testSetup.fastifyInstance.inject({
            method: 'GET',
            url: '/api/person/find?filters=live;eq;true',
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        const findByResult = await findByResp.json()
        expect(findByResp.statusCode).toBe(200)
        expect(findByResult.length).toBe(1)
        expect(findByResult[0].fullname).toBe("Active Person")
    })

    // 8. Create and Group By
    it("should create and groupBy for people", async () => {
        const { accessToken } = await testSetup.rootUserLogin()
        await testSetup.dropCollection('Person')

        const entityData = [
            { fullname: "Group A1", race: "human", address: defaultAddress },
            { fullname: "Group A2", race: "human", address: defaultAddress },
            { fullname: "Group B1", race: "elf", address: defaultAddress }
        ]

        for (const data of entityData) {
            await testSetup.fastifyInstance.inject({
                method: 'POST',
                url: '/api/person',
                payload: data,
                headers: { Authorization: `Bearer ${accessToken}` }
            })
        }

        const groupResp = await testSetup.fastifyInstance.inject({
            method: 'GET',
            url: '/api/person/group-by?fields=race',
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        const groupResult = await groupResp.json()
        expect(groupResp.statusCode).toBe(200)
        expect(groupResult.length).toBeGreaterThan(0)
    })

    // 9. Error Handling - Not Found
    it("should handle error responses correctly when person is not found", async () => {
        const { accessToken } = await testSetup.rootUserLogin()
        const nonExistentId = "123456789012345678901234"

        const resp = await testSetup.fastifyInstance.inject({
            method: 'GET',
            url: `/api/person/${nonExistentId}`,
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        expect(resp.statusCode).toBe(404)
        const result = await resp.json()
        expect(result.error).toBeDefined()
        expect(result.message).toContain("Not found")
    })

    // Unhappy Path - Auth
    it("should return 401 when accessing endpoints without token", async () => {
        const resp = await testSetup.fastifyInstance.inject({
            method: 'GET',
            url: '/api/person'
        })
        expect(resp.statusCode).toBe(401)
    })

    it("should return 400 when providing invalid ID format", async () => {
        const { accessToken } = await testSetup.rootUserLogin()
        const resp = await testSetup.fastifyInstance.inject({
            method: 'GET',
            url: '/api/person/invalid-id-format',
            headers: { Authorization: `Bearer ${accessToken}` }
        })
        expect(resp.statusCode).toBe(400)
    })

    // ==========================================
    // Multi-Tenancy Tests
    // ==========================================

    it("Tenant One records cannot be accessed by Tenant Two", async () => {
        await testSetup.dropCollection('Person')

        // 1. Login Tenant One & Two
        const { accessToken: tokenOne } = await testSetup.tenantOneUserLogin()
        const { accessToken: tokenTwo } = await testSetup.tenantTwoUserLogin()
        expect(tokenOne).toBeTruthy()
        expect(tokenTwo).toBeTruthy()

        // 2. Tenant One creates a record
        const createResp = await testSetup.fastifyInstance.inject({
            method: 'POST',
            url: '/api/person',
            payload: { fullname: "Tenant One Person", address: defaultAddress },
            headers: { Authorization: `Bearer ${tokenOne}` }
        })
        expect(createResp.statusCode).toBe(200)
        const t1Person = await createResp.json()
        const t1PersonId = t1Person._id
        expect(t1Person.fullname).toBe("Tenant One Person")

        // 3. Tenant Two attempts to GET the record
        const getT2Resp = await testSetup.fastifyInstance.inject({
            method: 'GET',
            url: `/api/person/${t1PersonId}`,
            headers: { Authorization: `Bearer ${tokenTwo}` }
        })
        expect(getT2Resp.statusCode).not.toBe(200)

        // 4. Tenant Two attempts to paginate the record
        const paginateT2Resp = await testSetup.fastifyInstance.inject({
            method: 'GET',
            url: `/api/person?search=Tenant One Person`,
            headers: { Authorization: `Bearer ${tokenTwo}` }
        })
        expect(paginateT2Resp.statusCode).toBe(200)
        const paginateT2Body = await paginateT2Resp.json()
        expect(paginateT2Body.items).toEqual([])
        expect(paginateT2Body.total).toBe(0)

        // 5. Tenant Two attempts to find the record with filters
        const findT2Resp = await testSetup.fastifyInstance.inject({
            method: 'GET',
            url: `/api/person/find?filters=fullname;eq;Tenant One Person`,
            headers: { Authorization: `Bearer ${tokenTwo}` }
        })
        expect(findT2Resp.statusCode).toBe(200)
        expect(await findT2Resp.json()).toEqual([])

        // 6. Tenant Two attempts to findBy the record
        const findByT2Resp = await testSetup.fastifyInstance.inject({
            method: 'GET',
            url: `/api/person/find-by/fullname/Tenant One Person`,
            headers: { Authorization: `Bearer ${tokenTwo}` }
        })
        expect(findByT2Resp.statusCode).toBe(200)
        expect(await findByT2Resp.json()).toEqual([])

        // 7. Tenant Two attempts to findOneBy the record
        const findOneByT2Resp = await testSetup.fastifyInstance.inject({
            method: 'GET',
            url: `/api/person/find-one-by/fullname/Tenant One Person`,
            headers: { Authorization: `Bearer ${tokenTwo}` }
        })
        expect(findOneByT2Resp.statusCode).toBe(200)
        expect(await findOneByT2Resp.json()).toEqual({})

        // 8. Tenant Two attempts to UPDATE the record
        const updateT2Resp = await testSetup.fastifyInstance.inject({
            method: 'PUT',
            url: `/api/person/${t1PersonId}`,
            payload: { fullname: "Hacked by T2", address: defaultAddress },
            headers: { Authorization: `Bearer ${tokenTwo}` }
        })
        expect(updateT2Resp.statusCode).not.toBe(200)

        // 9. Tenant Two attempts to PATCH the record
        const updatePartialT2Resp = await testSetup.fastifyInstance.inject({
            method: 'PATCH',
            url: `/api/person/${t1PersonId}`,
            payload: { fullname: "Patched by T2" },
            headers: { Authorization: `Bearer ${tokenTwo}` }
        })
        expect(updatePartialT2Resp.statusCode).not.toBe(200)

        // 10. Tenant Two attempts to DELETE the record
        const deleteT2Resp = await testSetup.fastifyInstance.inject({
            method: 'DELETE',
            url: `/api/person/${t1PersonId}`,
            headers: { Authorization: `Bearer ${tokenTwo}` }
        })
        expect(deleteT2Resp.statusCode).not.toBe(200)

        // 11. Tenant One can successfully read it unchanged
        const getT1Resp = await testSetup.fastifyInstance.inject({
            method: 'GET',
            url: `/api/person/${t1PersonId}`,
            headers: { Authorization: `Bearer ${tokenOne}` }
        })
        expect(getT1Resp.statusCode).toBe(200)
        expect((await getT1Resp.json()).fullname).toBe("Tenant One Person")
    })

    it("Root external admin can access records from any tenant", async () => {
        await testSetup.dropCollection('Person')

        // 1. Logins
        const { accessToken: tokenOne } = await testSetup.tenantOneUserLogin()
        const { accessToken: rootToken } = await testSetup.rootUserLogin()

        // 2. Tenant One creates a record
        const createResp = await testSetup.fastifyInstance.inject({
            method: 'POST',
            url: '/api/person',
            payload: { fullname: "Tenant One Admin Test", address: defaultAddress },
            headers: { Authorization: `Bearer ${tokenOne}` }
        })
        expect(createResp.statusCode).toBe(200)
        const t1PersonId = (await createResp.json())._id

        // 3. Root Admin views the record
        const getRootResp = await testSetup.fastifyInstance.inject({
            method: 'GET',
            url: `/api/person/${t1PersonId}`,
            headers: { Authorization: `Bearer ${rootToken}` }
        })
        expect(getRootResp.statusCode).toBe(200)

        // 4. Root Admin updates the record
        const updateRootResp = await testSetup.fastifyInstance.inject({
            method: 'PUT',
            url: `/api/person/${t1PersonId}`,
            payload: { fullname: "Updated by Root", address: defaultAddress },
            headers: { Authorization: `Bearer ${rootToken}` }
        })
        expect(updateRootResp.statusCode).toBe(200)

        // 5. Root Admin deletes the record
        const deleteRootResp = await testSetup.fastifyInstance.inject({
            method: 'DELETE',
            url: `/api/person/${t1PersonId}`,
            headers: { Authorization: `Bearer ${rootToken}` }
        })
        expect(deleteRootResp.statusCode).toBe(200)

        // Verify it was actually deleted
        const getRootDeletedResp = await testSetup.fastifyInstance.inject({
            method: 'GET',
            url: `/api/person/${t1PersonId}`,
            headers: { Authorization: `Bearer ${rootToken}` }
        })
        expect(getRootDeletedResp.statusCode).toBe(404)
    })

})
