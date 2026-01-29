import {describe, it, beforeAll, afterAll, expect} from "vitest"
import TenantRoute from "../../src/routes/TenantRoutes";
import TestSetup from "../setup/TestSetup";


describe("Tenant Route Test", function () {

    let testSetup = new TestSetup()
    let FASTIFY_TEST_SERVER: any;
    let ACCESS_TOKEN: any;

    beforeAll(async () => {
        await testSetup.setup()
        FASTIFY_TEST_SERVER = testSetup.fastifyInstance
        const {accessToken} = await testSetup.login()
        ACCESS_TOKEN = accessToken
    })

    afterAll(async () => {
        await testSetup.mongoInMemory.DropAndClose()
        return
    })

    it("Me", async () => {

        const resp = await FASTIFY_TEST_SERVER.inject({
            method: 'get',
            url: '/api/auth/me',
            headers: {Authorization: `Bearer ${ACCESS_TOKEN}`}
        });
        let body = resp.json()
        console.log("me", body)
    })

    it("Should paginate tenant", async () => {
        // First, create a few tenants
        const tenantData = [
            {name: "Tenant1"},
            {name: "Tenant2"},
            {name: "Tenant3"}
        ];

        for (const data of tenantData) {
            await FASTIFY_TEST_SERVER.inject({
                method: 'POST',
                url: '/api/tenants',
                payload: data,
                headers: {Authorization: `Bearer ${ACCESS_TOKEN}`}
            });
        }

        const resp = await FASTIFY_TEST_SERVER.inject({
            method: 'GET',
            url: '/api/tenants',
            headers: {Authorization: `Bearer ${ACCESS_TOKEN}`}
        })

        const result = await resp.json()
        expect(resp.statusCode).toBe(200)
        expect(result.items.length).toBe(3)
        expect(result.items[0].name).toBe("Tenant1")
        expect(result.page).toBe(1)
        expect(result.limit).toBe(10)


    })

    it("should create a new tenant", async () => {
        const newTenant = {
            name: "NewTestTenant"
        };

        const resp = await FASTIFY_TEST_SERVER.inject({
            method: 'POST',
            url: '/api/tenants',
            payload: newTenant,
            headers: {Authorization: `Bearer ${ACCESS_TOKEN}`}
        });

        const result = await resp.json();
        expect(resp.statusCode).toBe(200);
        expect(result.name).toBe("NewTestTenant");
        expect(result._id).toBeDefined();

        // Verify tenant was created by fetching it
        const getResp = await FASTIFY_TEST_SERVER.inject({
            method: 'GET',
            url: '/api/tenants/' + result.id,
            headers: {Authorization: `Bearer ${ACCESS_TOKEN}`}
        });

        const getTenant = await getResp.json();
        expect(getResp.statusCode).toBe(200);
        expect(getTenant.name).toBe("NewTestTenant");
    })

    it("should update an existing tenant", async () => {

        const newTenant = {
            name: "ExistTenant"
        };

        const resp = await FASTIFY_TEST_SERVER.inject({
            method: 'POST',
            url: '/api/tenants',
            payload: newTenant,
            headers: {Authorization: `Bearer ${ACCESS_TOKEN}`}
        });

        // First, get existing tenants to extract the id
        const getResp = await FASTIFY_TEST_SERVER.inject({
            method: 'GET',
            url: '/api/tenants',
            headers: {Authorization: `Bearer ${ACCESS_TOKEN}`}
        })

        const result = await getResp.json()
        const tenantId = result.items[0].id

        // Prepare update data
        const updateData = {
            name: "UpdatedTenantName"
        }

        // Send update request
        const updateResp = await FASTIFY_TEST_SERVER.inject({
            method: 'PUT',
            url: `/api/tenants/${tenantId}`,
            payload: updateData,
            headers: {Authorization: `Bearer ${ACCESS_TOKEN}`}
        })

        // Verify update response
        expect(updateResp.statusCode).toBe(200)
        const updatedTenant = await updateResp.json()
        expect(updatedTenant.name).toBe("UpdatedTenantName")

        // Verify the tenant was actually updated by fetching it again
        const verifyResp = await FASTIFY_TEST_SERVER.inject({
            method: 'GET',
            url: `/api/tenants/${tenantId}`,
            headers: {Authorization: `Bearer ${ACCESS_TOKEN}`}
        })

        const verifiedTenant = await verifyResp.json()
        expect(verifyResp.statusCode).toBe(200)
        expect(verifiedTenant.name).toBe("UpdatedTenantName")

        // Send update inexistingId should return 404
        const updateRespNotFound = await FASTIFY_TEST_SERVER.inject({
            method: 'PUT',
            url: `/api/tenants/66761bed94d57a42c3277bab`,
            payload: updateData,
            headers: {Authorization: `Bearer ${ACCESS_TOKEN}`}
        })

        // Verify update response
        expect(updateRespNotFound.statusCode).toBe(404)

    })

    it("should delete an existing tenant", async () => {
        // First create a tenant to be deleted
        const newTenant = {
            name: "TenantToDelete"
        };

        const createResp = await FASTIFY_TEST_SERVER.inject({
            method: 'POST',
            url: '/api/tenants',
            payload: newTenant,
            headers: {Authorization: `Bearer ${ACCESS_TOKEN}`}
        });

        const createdTenant = await createResp.json();
        expect(createResp.statusCode).toBe(200);
        const tenantId = createdTenant.id;

        // Delete the tenant
        const deleteResp = await FASTIFY_TEST_SERVER.inject({
            method: 'DELETE',
            url: `/api/tenants/${tenantId}`,
            headers: {Authorization: `Bearer ${ACCESS_TOKEN}`}
        });

        // Verify delete response
        expect(deleteResp.statusCode).toBe(200);
        const deleteResult = await deleteResp.json();
        expect(deleteResult.deleted).toBe(true);

        // Verify the tenant was actually deleted by trying to fetch it
        const verifyResp = await FASTIFY_TEST_SERVER.inject({
            method: 'GET',
            url: `/api/tenants/${tenantId}`,
            headers: {Authorization: `Bearer ${ACCESS_TOKEN}`}
        });

        // Should return 404 or empty response
        expect(verifyResp.statusCode).toBe(404);
    })

    it("should find a tenant by ID", async () => {
        // First create a tenant to ensure we have one with known ID
        const newTenant = {
            name: "FindByIdTenant"
        };

        const createResp = await FASTIFY_TEST_SERVER.inject({
            method: 'POST',
            url: '/api/tenants',
            payload: newTenant,
            headers: {Authorization: `Bearer ${ACCESS_TOKEN}`}
        });

        const createdTenant = await createResp.json();
        expect(createResp.statusCode).toBe(200);
        const tenantId = createdTenant.id;

        // Now fetch the tenant by ID
        const getResp = await FASTIFY_TEST_SERVER.inject({
            method: 'GET',
            url: `/api/tenants/${tenantId}`,
            headers: {Authorization: `Bearer ${ACCESS_TOKEN}`}
        });

        // Verify the response
        expect(getResp.statusCode).toBe(200);
        const fetchedTenant = await getResp.json();
        expect(fetchedTenant._id).toBe(tenantId);
        expect(fetchedTenant.name).toBe("FindByIdTenant");
    })

    it("should search for tenants ", async () => {
        // First, create a few tenants for search testing
        const tenantData = [
            {name: "SearchTenant1"},
            {name: "SearchTenant2"},
            {name: "DifferentTenant"}
        ];

        // Create the test tenants
        for (const data of tenantData) {
            await FASTIFY_TEST_SERVER.inject({
                method: 'POST',
                url: '/api/tenants',
                payload: data,
                headers: {Authorization: `Bearer ${ACCESS_TOKEN}`}
            });
        }

        // Test searching with a matching term
        const searchResp = await FASTIFY_TEST_SERVER.inject({
            method: 'GET',
            url: '/api/tenants/search?search=Search',
            headers: {Authorization: `Bearer ${ACCESS_TOKEN}`}
        });

        const searchResult = await searchResp.json();
        console.log("searchResult",searchResult)

        expect(searchResp.statusCode).toBe(200);
        expect(searchResult.length).toBe(2); // Should find the two tenants with "Search" in their name
        expect(searchResult.some(tenant => tenant.name === "SearchTenant1")).toBe(true);
        expect(searchResult.some(tenant => tenant.name === "SearchTenant2")).toBe(true);
        expect(searchResult.some(tenant => tenant.name === "DifferentTenant")).toBe(false);

    })

    it("Should get all tenants", async () => {
        // First, create a few tenants
        const tenantData = [
            {name: "SearchTenant1"},
            {name: "SearchTenant2"},
            {name: "SearchTenant3"}
        ];

        for (const data of tenantData) {
            await FASTIFY_TEST_SERVER.inject({
                method: 'POST',
                url: '/api/tenants',
                payload: data,
                headers: {Authorization: `Bearer ${ACCESS_TOKEN}`}
            });
        }

        // Get all tenants
        const resp = await FASTIFY_TEST_SERVER.inject({
            method: 'GET',
            url: '/api/tenants/all',
            headers: {Authorization: `Bearer ${ACCESS_TOKEN}`}
        });

        const result = await resp.json();
        console.log("result",result)

        expect(resp.statusCode).toBe(200);

        // Should be an array with at least 2 tenants
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThanOrEqual(3);


    })

    it("should find tenants by specific field-value pair", async () => {
        // First create tenants with specific field values for testing
        const tenantData = [
            {name: "FieldTenantA"},
            {name: "FieldTenantB"},
            {name: "ASD"}
        ];

        // Create the test tenants
        for (const data of tenantData) {
            await FASTIFY_TEST_SERVER.inject({
                method: 'POST',
                url: '/api/tenants',
                payload: data,
                headers: {Authorization: `Bearer ${ACCESS_TOKEN}`}
            });
        }

        // Test finding by description field with value "Special"
        const findByResp = await FASTIFY_TEST_SERVER.inject({
            method: 'GET',
            url: '/api/tenants/find-by/name/FieldTenantA',
            headers: {Authorization: `Bearer ${ACCESS_TOKEN}`}
        });

        const findByResult = await findByResp.json();
        expect(findByResp.statusCode).toBe(200);
        expect(Array.isArray(findByResult)).toBe(true);
        expect(findByResult.length).toBe(1); // Should find the two tenants with "Special" description
        expect(findByResult.some(tenant => tenant.name === "FieldTenantA")).toBe(true);
        expect(findByResult.some(tenant => tenant.name === "FieldTenantB")).toBe(false);
        expect(findByResult.some(tenant => tenant.name === "FieldTenantC")).toBe(false);
    })

    it("should handle error responses correctly when tenant is not found", async () => {
    // Try to fetch a non-existent tenant
    const nonExistentId = "123456789012345678901234"; // Valid MongoDB ObjectId that doesn't exist

    const resp = await FASTIFY_TEST_SERVER.inject({
        method: 'GET',
        url: `/api/tenants/${nonExistentId}`,
        headers: {Authorization: `Bearer ${ACCESS_TOKEN}`}
    });

    // Verify response status code should be 404 Not Found
    expect(resp.statusCode).toBe(404);

    const result = await resp.json();
    expect(result.error).toBeDefined();
    expect(result.message).toContain("Not found");

});


})
