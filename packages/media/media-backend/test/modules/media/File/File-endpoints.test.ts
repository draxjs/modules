import { describe, it, beforeAll, afterAll, expect } from "vitest"
import FileRoutes from "../../../../src/routes/FileRoutes.js"
import FilePermissions from "../../../../src/permissions/FilePermissions.js"
import TestSetup from "../../../setup/TestSetup.js"
import type { IFileBase } from "../../../../src/interfaces/IFile.js"

describe("File Endpoints Test", function () {

    let testSetup = new TestSetup({
        routes: [FileRoutes],
        permissions: [FilePermissions]
    })

    beforeAll(async () => {
        await testSetup.setup()
    })

    afterAll(async () => {
        await testSetup.dropAndClose()
        return
    })

    it("should create a new File and find by id", async () => {
        const { accessToken } = await testSetup.rootUserLogin()
        expect(accessToken).toBeTruthy()
        await testSetup.dropCollection('File')

        const newFile: IFileBase = {
            filename: "test-file.txt",
            relativePath: "/docs/test-file.txt",
            absolutePath: "/var/www/docs/test-file.txt",
            url: "http://example.com/test-file.txt",
            description: "Test description",
            tags: ["test", "test2"],
            mimetype: "text/plain",
            encoding: "utf-8",
            extension: "txt",
            size: 1024,
            type: "document",
            lastAccess: new Date(),
            ttlSeconds: 3600,
            isPublic: true,
            hits: 0
        }

        const resp = await testSetup.fastifyInstance.inject({
            method: 'POST',
            url: '/api/file',
            payload: newFile,
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        const entity = await resp.json()
        expect(resp.statusCode).toBe(200)
        expect(entity.filename).toBe("test-file.txt")
        expect(entity._id).toBeDefined()

        const getResp = await testSetup.fastifyInstance.inject({
            method: 'GET',
            url: '/api/file/' + entity._id,
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        const getEntity = await getResp.json()
        expect(getResp.statusCode).toBe(200)
        expect(getEntity.filename).toBe("test-file.txt")
    })

    it("should create and update a File and finally find by id", async () => {
        const { accessToken } = await testSetup.rootUserLogin()
        expect(accessToken).toBeTruthy()
        await testSetup.dropCollection('File')

        const newFile: IFileBase = {
            filename: "test-file.txt",
            relativePath: "/docs/test-file.txt",
            absolutePath: "/var/www/docs/test-file.txt",
            url: "http://example.com/test-file.txt",
            description: "Original description",
            tags: ["test", "test2"],
            mimetype: "text/plain",
            encoding: "utf-8",
            extension: "txt",
            size: 1024,
            type: "document",
            lastAccess: new Date(),
            ttlSeconds: 3600,
            isPublic: true,
            hits: 0
        }

        const resp = await testSetup.fastifyInstance.inject({
            method: 'POST',
            url: '/api/file',
            payload: newFile,
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        const entity = await resp.json()
        expect(resp.statusCode).toBe(200)
        expect(entity._id).toBeDefined()

        const updateData: IFileBase = {
            ...newFile,
            filename: "Updated File",
            description: "Updated description"
        }

        const updateResp = await testSetup.fastifyInstance.inject({
            method: 'PUT',
            url: `/api/file/${entity._id}`,
            payload: updateData,
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        expect(updateResp.statusCode).toBe(200)
        const updatedEntity = await updateResp.json()
        expect(updatedEntity.filename).toBe("Updated File")

        const verifyResp = await testSetup.fastifyInstance.inject({
            method: 'GET',
            url: `/api/file/${updatedEntity._id}`,
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        const verifiedEntity = await verifyResp.json()
        expect(verifyResp.statusCode).toBe(200)
        expect(verifiedEntity.filename).toBe("Updated File")
    })

    it("should create and update partial a File and finally find by id", async () => {
        const { accessToken } = await testSetup.rootUserLogin()
        expect(accessToken).toBeTruthy()
        await testSetup.dropCollection('File')

        const newFile: IFileBase = {
            filename: "test-file.txt",
            relativePath: "/docs/test-file.txt",
            absolutePath: "/var/www/docs/test-file.txt",
            url: "http://example.com/test-file.txt",
            description: "Original description",
            tags: ["test"],
            mimetype: "text/plain",
            encoding: "utf-8",
            extension: "txt",
            size: 1024,
            type: "document",
            lastAccess: new Date(),
            ttlSeconds: 3600,
            isPublic: true,
            hits: 0
        }

        const resp = await testSetup.fastifyInstance.inject({
            method: 'POST',
            url: '/api/file',
            payload: newFile,
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        const entity = await resp.json()
        expect(resp.statusCode).toBe(200)

        const updateData: any = {
            filename: "Updated Partial"
        }

        const updateResp = await testSetup.fastifyInstance.inject({
            method: 'PATCH',
            url: `/api/file/${entity._id}`,
            payload: updateData,
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        expect(updateResp.statusCode).toBe(200)
        const updatedEntity = await updateResp.json()
        expect(updatedEntity.filename).toBe("Updated Partial")

        const verifyResp = await testSetup.fastifyInstance.inject({
            method: 'GET',
            url: `/api/file/${updatedEntity._id}`,
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        const verifiedEntity = await verifyResp.json()
        expect(verifyResp.statusCode).toBe(200)
        expect(verifiedEntity.filename).toBe("Updated Partial")
    })

    it("should create and delete a File", async () => {
        const { accessToken } = await testSetup.rootUserLogin()
        expect(accessToken).toBeTruthy()
        await testSetup.dropCollection('File')

        const newFile: IFileBase = {
            filename: "test-file-delete.txt",
            relativePath: "/docs/test-file.txt",
            absolutePath: "/var/www/docs/test-file.txt",
            url: "http://example.com/test-file.txt",
            description: "To Delete",
            tags: [],
            mimetype: "text/plain",
            encoding: "utf-8",
            extension: "txt",
            size: 1024,
            type: "document",
            lastAccess: new Date(),
            ttlSeconds: 3600,
            isPublic: true,
            hits: 0
        }

        const createResp = await testSetup.fastifyInstance.inject({
            method: 'POST',
            url: '/api/file',
            payload: newFile,
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        const createdEntity = await createResp.json()
        expect(createResp.statusCode).toBe(200)
        const entityId = createdEntity._id

        const deleteResp = await testSetup.fastifyInstance.inject({
            method: 'DELETE',
            url: `/api/file/${entityId}`,
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        expect(deleteResp.statusCode).toBe(200)
        const deleteResult = await deleteResp.json()
        expect(deleteResult.deleted).toBe(true);

        const verifyResp = await testSetup.fastifyInstance.inject({
            method: 'GET',
            url: `/api/file/${entityId}`,
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        expect(verifyResp.statusCode).toBe(404)
    })

    it("Should create and paginate File", async () => {
        const { accessToken } = await testSetup.rootUserLogin()
        expect(accessToken).toBeTruthy()
        await testSetup.dropCollection('File')

        const entityData = [
            {
                filename: "File 1", relativePath: "f1", absolutePath: "f1", url: "url1", mimetype: "txt", encoding: "1", extension: "1", size: 1, type: "1", lastAccess: new Date(), ttlSeconds: 1
            },
            {
                filename: "File 2", relativePath: "f2", absolutePath: "f2", url: "url2", mimetype: "txt", encoding: "1", extension: "1", size: 1, type: "1", lastAccess: new Date(), ttlSeconds: 1
            }
        ]

        for (const data of entityData) {
            const respCreate = await testSetup.fastifyInstance.inject({
                method: 'POST',
                url: '/api/file',
                payload: data,
                headers: { Authorization: `Bearer ${accessToken}` }
            })

            const resultCreate = await respCreate.json()
            console.log("resultCreate",resultCreate)
        }

        const resp = await testSetup.fastifyInstance.inject({
            method: 'GET',
            url: '/api/file',
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        const result = await resp.json()
        expect(resp.statusCode).toBe(200)
        console.log("result",result)
        expect(result.items.length).toBe(2)
        expect(result.total).toBe(2)
        expect(result.page).toBe(1)
        expect(result.limit).toBe(10)
    })

    it("should create and search for File", async () => {
        const { accessToken } = await testSetup.rootUserLogin()
        expect(accessToken).toBeTruthy()
        await testSetup.dropCollection('File')

        const entityData = [
            { filename: "Search Entity 1", relativePath: "s1", absolutePath: "s1", url: "url1", mimetype: "txt", encoding: "1", extension: "1", size: 1, type: "1", lastAccess: new Date(), ttlSeconds: 1 },
            { filename: "Search Entity 2", relativePath: "s2", absolutePath: "s2", url: "url2", mimetype: "txt", encoding: "1", extension: "1", size: 1, type: "2", lastAccess: new Date(), ttlSeconds: 1 },
            { filename: "Other Entity", relativePath: "o1", absolutePath: "o1", url: "urlo", mimetype: "txt", encoding: "1", extension: "1", size: 1, type: "3", lastAccess: new Date(), ttlSeconds: 1 }
        ]

        for (const data of entityData) {
            await testSetup.fastifyInstance.inject({
                method: 'POST',
                url: '/api/file',
                payload: data,
                headers: { Authorization: `Bearer ${accessToken}` }
            })
        }

        const searchResp = await testSetup.fastifyInstance.inject({
            method: 'GET',
            url: '/api/file/search?search=Search',
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        const searchResult = await searchResp.json()
        expect(searchResp.statusCode).toBe(200)
        expect(searchResult.length).toBe(2)
        expect(searchResult.some(entity => entity.filename === "Search Entity 1")).toBe(true)
        expect(searchResult.some(entity => entity.filename === "Search Entity 2")).toBe(true)
    })

    it("should create and find File with filters", async () => {
        const { accessToken } = await testSetup.rootUserLogin()
        expect(accessToken).toBeTruthy()
        await testSetup.dropCollection('File')

        const entityData = [
            { filename: "Entity 1", type: "document", relativePath: "e1", absolutePath: "e1", url: "u1", mimetype: "txt", encoding: "u", extension: "1", size: 1, lastAccess: new Date(), ttlSeconds: 1 },
            { filename: "Entity 2", type: "image", relativePath: "e2", absolutePath: "e2", url: "u2", mimetype: "img", encoding: "u", extension: "1", size: 1, lastAccess: new Date(), ttlSeconds: 1 }
        ]

        for (const data of entityData) {
            await testSetup.fastifyInstance.inject({
                method: 'POST',
                url: '/api/file',
                payload: data,
                headers: { Authorization: `Bearer ${accessToken}` }
            })
        }

        const findByResp = await testSetup.fastifyInstance.inject({
            method: 'GET',
            url: '/api/file/find?filters=type;eq;document',
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        const findByResult = await findByResp.json()
        expect(findByResp.statusCode).toBe(200)
        expect(Array.isArray(findByResult)).toBe(true)
        expect(findByResult.length).toBe(1)
        expect(findByResult[0].filename).toBe("Entity 1")
    })

    it("should create and groupBy for File", async () => {
        const { accessToken } = await testSetup.rootUserLogin()
        expect(accessToken).toBeTruthy()
        await testSetup.dropCollection('File')

        const entityData = [
            { filename: "Entity 1", type: "typeA", mimetype: "active", relativePath: "g1", absolutePath: "g1", url: "g1", encoding: "u", extension: "1", size: 1, lastAccess: new Date(), ttlSeconds: 1 },
            { filename: "Entity 2", type: "typeB", mimetype: "active", relativePath: "g2", absolutePath: "g2", url: "g2", encoding: "u", extension: "1", size: 1, lastAccess: new Date(), ttlSeconds: 1 },
            { filename: "Entity 3", type: "typeB", mimetype: "active", relativePath: "g3", absolutePath: "g3", url: "g3", encoding: "u", extension: "1", size: 1, lastAccess: new Date(), ttlSeconds: 1 }
        ]

        for (const data of entityData) {
            await testSetup.fastifyInstance.inject({
                method: 'POST',
                url: '/api/file',
                payload: data,
                headers: { Authorization: `Bearer ${accessToken}` }
            })
        }

        const groupResp = await testSetup.fastifyInstance.inject({
            method: 'GET',
            url: '/api/file/group-by?fields=type,mimetype',
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        const groupResult = await groupResp.json()
        expect(groupResp.statusCode).toBe(200)
        console.log("groupResult",groupResult)
        expect(groupResult[0].count).toBe(2)
        expect(groupResult[0].type).toBe('typeB')
        expect(groupResult[1].count).toBe(1)
        expect(groupResult[1].type).toBe('typeA')
    })

    it("should return 401 when accessing endpoints without token", async () => {
        const resp = await testSetup.fastifyInstance.inject({
            method: 'GET',
            url: '/api/file'
        });
        expect(resp.statusCode).toBe(401);
    });

    it("should return 403 when creating with restricted user", async () => {
        const { accessToken } = await testSetup.basicUserLogin();

        const resp = await testSetup.fastifyInstance.inject({
            method: 'POST',
            url: '/api/file',
            payload: { filename: "Forbidden" },
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        expect(resp.statusCode).toBe(403);
    });

    it("should return 422 when creating with missing mandatory fields", async () => {
        const { accessToken } = await testSetup.rootUserLogin();

        const resp = await testSetup.fastifyInstance.inject({
            method: 'POST',
            url: '/api/file',
            payload: {},
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        expect(resp.statusCode).toBe(422);
    });

    it("should handle error responses correctly when File is not found", async () => {
        const { accessToken } = await testSetup.rootUserLogin()
        expect(accessToken).toBeTruthy()

        const nonExistentId = "123456789012345678901234"

        const resp = await testSetup.fastifyInstance.inject({
            method: 'GET',
            url: `/api/file/${nonExistentId}`,
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        expect(resp.statusCode).toBe(404)
        const result = await resp.json()
        expect(result.error).toBeDefined()
    })

    it("should return 400 when providing invalid ID format", async () => {
        const { accessToken } = await testSetup.rootUserLogin();

        const resp = await testSetup.fastifyInstance.inject({
            method: 'GET',
            url: '/api/file/invalid-id-format',
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        expect(resp.statusCode).toBe(400);
    });

    it("should return 404 when updating non-existent resource", async () => {
        const { accessToken } = await testSetup.rootUserLogin();
        const nonExistentId = "123456789012345678901234";

        const resp = await testSetup.fastifyInstance.inject({
            method: 'PUT',
            url: `/api/file/${nonExistentId}`,
            payload: {
                filename: "Non-existent", relativePath: "s1", absolutePath: "s1", url: "url1", mimetype: "txt", encoding: "1", extension: "1", size: 1, type: "1", lastAccess: new Date(), ttlSeconds: 1
            },
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        expect(resp.statusCode).toBe(404);
    });

    // ==========================================
    // Multi-Tenancy Tests
    // ==========================================

    it("Tenant One files cannot be accessed by Tenant Two", async () => {
        await testSetup.dropCollection('File')

        const { accessToken: tokenOne } = await testSetup.tenantOneUserLogin()
        const { accessToken: tokenTwo } = await testSetup.tenantTwoUserLogin()
        expect(tokenOne).toBeTruthy()
        expect(tokenTwo).toBeTruthy()

        const tenantOneFile: IFileBase = {
            filename: "tenant-one-file.txt",
            relativePath: "/docs/tenant-one-file.txt",
            absolutePath: "/var/www/docs/tenant-one-file.txt",
            url: "http://example.com/tenant-one-file.txt",
            description: "Tenant One File",
            tags: ["tenant-one"],
            mimetype: "text/plain",
            encoding: "utf-8",
            extension: "txt",
            size: 1024,
            type: "document",
            lastAccess: new Date(),
            ttlSeconds: 3600,
            isPublic: true,
            hits: 0
        }

        const createResp = await testSetup.fastifyInstance.inject({
            method: 'POST',
            url: '/api/file',
            payload: tenantOneFile,
            headers: { Authorization: `Bearer ${tokenOne}` }
        })
        expect(createResp.statusCode).toBe(200)
        const createdFile = await createResp.json()
        const tenantOneFileId = createdFile._id
        expect(createdFile.filename).toBe("tenant-one-file.txt")


        const getT1Resp = await testSetup.fastifyInstance.inject({
            method: 'GET',
            url: `/api/file/${tenantOneFileId}`,
            headers: { Authorization: `Bearer ${tokenOne}` }
        })
        expect(getT1Resp.statusCode).toBe(200)
        expect((await getT1Resp.json()).filename).toBe("tenant-one-file.txt")

        const getT2Resp = await testSetup.fastifyInstance.inject({
            method: 'GET',
            url: `/api/file/${tenantOneFileId}`,
            headers: { Authorization: `Bearer ${tokenTwo}` }
        })
        expect(getT2Resp.statusCode).not.toBe(200)

        const paginateT2Resp = await testSetup.fastifyInstance.inject({
            method: 'GET',
            url: '/api/file?search=tenant-one-file.txt',
            headers: { Authorization: `Bearer ${tokenTwo}` }
        })
        expect(paginateT2Resp.statusCode).toBe(200)
        const paginateT2Body = await paginateT2Resp.json()
        expect(paginateT2Body.items).toEqual([])
        expect(paginateT2Body.total).toBe(0)

        const searchT2Resp = await testSetup.fastifyInstance.inject({
            method: 'GET',
            url: '/api/file/search?search=tenant-one-file.txt',
            headers: { Authorization: `Bearer ${tokenTwo}` }
        })
        expect(searchT2Resp.statusCode).toBe(200)
        expect(await searchT2Resp.json()).toEqual([])

        const findT2Resp = await testSetup.fastifyInstance.inject({
            method: 'GET',
            url: '/api/file/find?filters=filename;eq;tenant-one-file.txt',
            headers: { Authorization: `Bearer ${tokenTwo}` }
        })
        expect(findT2Resp.statusCode).toBe(200)
        expect(await findT2Resp.json()).toEqual([])

        const updateT2Resp = await testSetup.fastifyInstance.inject({
            method: 'PUT',
            url: `/api/file/${tenantOneFileId}`,
            payload: {
                ...tenantOneFile,
                filename: "hacked-by-tenant-two.txt",
                description: "Hacked by Tenant Two"
            },
            headers: { Authorization: `Bearer ${tokenTwo}` }
        })
        expect(updateT2Resp.statusCode).not.toBe(200)

        const updatePartialT2Resp = await testSetup.fastifyInstance.inject({
            method: 'PATCH',
            url: `/api/file/${tenantOneFileId}`,
            payload: { filename: "patched-by-tenant-two.txt" },
            headers: { Authorization: `Bearer ${tokenTwo}` }
        })
        expect(updatePartialT2Resp.statusCode).not.toBe(200)

        const deleteT2Resp = await testSetup.fastifyInstance.inject({
            method: 'DELETE',
            url: `/api/file/${tenantOneFileId}`,
            headers: { Authorization: `Bearer ${tokenTwo}` }
        })
        expect(deleteT2Resp.statusCode).not.toBe(200)


    })

})
