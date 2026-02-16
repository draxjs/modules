import {describe, it, beforeAll, afterAll, expect} from "vitest"
import CountryRoutes from "../../../../src/modules/people/routes/CountryRoutes";
import CountryPermissions from "../../../../src/modules/people/permissions/CountryPermissions";
import TestSetup from "../../../setup/TestSetup";


describe("Country Route Test", function () {

    let testSetup = new TestSetup({
        routes: [CountryRoutes],
        permissions: [CountryPermissions]
    })

    beforeAll(async () => {
        await testSetup.setup()
    })

    afterAll(async () => {
        await testSetup.dropAndClose()
        return
    })

    it("should create a new country and find by id", async () => {

        const {accessToken} = await testSetup.rootUserLogin()
        expect(accessToken).toBeTruthy()
        await testSetup.dropCollection('Country')

        const newCountry = {
            name: "Italia",
            metadata: {best: 'AI', worst: 'OU'}
        };

        const resp = await testSetup.fastifyInstance.inject({
            method: 'POST',
            url: '/api/countries',
            payload: newCountry,
            headers: {Authorization: `Bearer ${accessToken}`}
        });

        const country = await resp.json();
        expect(resp.statusCode).toBe(200);
        expect(country.name).toBe("Italia");
        expect(country.metadata.best).toBe("AI");
        expect(country.metadata.worst).toBe("OU");
        expect(country._id).toBeDefined();

        // Verify country was created by fetching it
        const getResp = await testSetup.fastifyInstance.inject({
            method: 'GET',
            url: '/api/countries/' + country._id,
            headers: {Authorization: `Bearer ${accessToken}`}
        });

        const getCountry = await getResp.json();
        expect(getResp.statusCode).toBe(200);
        expect(getCountry.name).toBe("Italia");
    })

    it("should create and update a country and finally find by id", async () => {

        const {accessToken} = await testSetup.rootUserLogin()
        expect(accessToken).toBeTruthy()
        await testSetup.dropCollection('Country')

        const newCountry = {
            name: "Italia"
        };

        const resp = await testSetup.fastifyInstance.inject({
            method: 'POST',
            url: '/api/countries',
            payload: newCountry,
            headers: {Authorization: `Bearer ${accessToken}`}
        });

        const country = await resp.json();
        expect(resp.statusCode).toBe(200);
        expect(country.name).toBe("Italia");
        expect(country._id).toBeDefined();


        // Prepare update data
        const updateData = {
            name: "ItaliaUpdated"
        }

        // Send update request
        const updateResp = await testSetup.fastifyInstance.inject({
            method: 'PUT',
            url: `/api/countries/${country._id}`,
            payload: updateData,
            headers: {Authorization: `Bearer ${accessToken}`}
        })

        // Verify update response
        expect(updateResp.statusCode).toBe(200)
        const updatedCountry = await updateResp.json()
        expect(updatedCountry.name).toBe("ItaliaUpdated")

        // Verify the country was actually updated by fetching it again
        const verifyResp = await testSetup.fastifyInstance.inject({
            method: 'GET',
            url: `/api/countries/${updatedCountry._id}`,
            headers: {Authorization: `Bearer ${accessToken}`}
        })

        const verifiedCountry = await verifyResp.json()
        expect(verifyResp.statusCode).toBe(200)
        expect(verifiedCountry.name).toBe("ItaliaUpdated")
    })

    it("should create and delete a country", async () => {

        const {accessToken} = await testSetup.rootUserLogin()
        expect(accessToken).toBeTruthy()
        await testSetup.dropCollection('Country')

        // First create a country to be deleted
        const newCountry = {
            name: "CountryToDelete"
        };

        const createResp = await testSetup.fastifyInstance.inject({
            method: 'POST',
            url: '/api/countries',
            payload: newCountry,
            headers: {Authorization: `Bearer ${accessToken}`}
        });

        const createdCountry = await createResp.json();
        expect(createResp.statusCode).toBe(200);
        const countryId = createdCountry._id;

        // Delete the country
        const deleteResp = await testSetup.fastifyInstance.inject({
            method: 'DELETE',
            url: `/api/countries/${countryId}`,
            headers: {Authorization: `Bearer ${accessToken}`}
        });

        // Verify delete response
        expect(deleteResp.statusCode).toBe(200);
        const deleteResult = await deleteResp.json();
        expect(deleteResult.deleted).toBe(true);

        // Verify the country was actually deleted by trying to fetch it
        const verifyResp = await testSetup.fastifyInstance.inject({
            method: 'GET',
            url: `/api/countries/${countryId}`,
            headers: {Authorization: `Bearer ${accessToken}`}
        });

        // Should return 404 or empty response
        expect(verifyResp.statusCode).toBe(404);
    })

    it("Should create and paginate countries", async () => {

        const {accessToken} = await testSetup.rootUserLogin()
        expect(accessToken).toBeTruthy()

        await testSetup.dropCollection('Country')

        // First, create a few countries
        const countryData = [
            {name: "Argentina"},
            {name: "Brasil"},
            {name: "Uruguay"}
        ];

        for (const data of countryData) {
            await testSetup.fastifyInstance.inject({
                method: 'POST',
                url: '/api/countries',
                payload: data,
                headers: {Authorization: `Bearer ${accessToken}`}
            });
        }

        const resp = await testSetup.fastifyInstance.inject({
            method: 'GET',
            url: '/api/countries',
            headers: {Authorization: `Bearer ${accessToken}`}
        })

        const result = await resp.json()
        expect(resp.statusCode).toBe(200)
        expect(result.items.length).toBe(3)
        expect(result.total).toBe(3)
        expect(result.page).toBe(1)
        expect(result.limit).toBe(10)
        expect(result.items[0].name).toBe("Argentina")
    })



    it("should find a country by ID", async () => {
        const {accessToken} = await testSetup.rootUserLogin()
        expect(accessToken).toBeTruthy()
        await testSetup.dropCollection('Country')

        // First create a country to ensure we have one with known ID
        const newCountry = {
            name: "FindByIdCountry"
        };

        const createResp = await testSetup.fastifyInstance.inject({
            method: 'POST',
            url: '/api/countries',
            payload: newCountry,
            headers: {Authorization: `Bearer ${accessToken}`}
        });

        const createdCountry = await createResp.json();
        expect(createResp.statusCode).toBe(200);
        const countryId = createdCountry._id;

        // Now fetch the country by ID
        const getResp = await testSetup.fastifyInstance.inject({
            method: 'GET',
            url: `/api/countries/${countryId}`,
            headers: {Authorization: `Bearer ${accessToken}`}
        });

        // Verify the response
        expect(getResp.statusCode).toBe(200);
        const fetchedCountry = await getResp.json();
        expect(fetchedCountry._id).toBe(countryId);
        expect(fetchedCountry.name).toBe("FindByIdCountry");
    })

    it("should search for countries ", async () => {
        const {accessToken} = await testSetup.rootUserLogin()
        expect(accessToken).toBeTruthy()
        await testSetup.dropCollection('Country')

        // First, create a few countries for search testing
        const countryData = [
            {name: "SearchCountry1"},
            {name: "SearchCountry2"},
            {name: "DifferentCountry"}
        ];

        // Create the test countries
        for (const data of countryData) {
            await testSetup.fastifyInstance.inject({
                method: 'POST',
                url: '/api/countries',
                payload: data,
                headers: {Authorization: `Bearer ${accessToken}`}
            });
        }

        // Test searching with a matching term
        const searchResp = await testSetup.fastifyInstance.inject({
            method: 'GET',
            url: '/api/countries/search?search=Search',
            headers: {Authorization: `Bearer ${accessToken}`}
        });

        const searchResult = await searchResp.json();
        console.log("searchResult", searchResult)

        expect(searchResp.statusCode).toBe(200);
        expect(searchResult.length).toBe(2); // Should find the two countries with "Search" in their name
        expect(searchResult.some(country => country.name === "SearchCountry1")).toBe(true);
        expect(searchResult.some(country => country.name === "SearchCountry2")).toBe(true);
        expect(searchResult.some(country => country.name === "DifferentCountry")).toBe(false);

    })

    it("should find countries with filters", async () => {
        const {accessToken} = await testSetup.rootUserLogin()
        expect(accessToken).toBeTruthy()
        await testSetup.dropCollection('Country')

        // First create countries with specific field values for testing
        const countryData = [
            {name: "FieldCountryA"},
            {name: "FieldCountryB"},
            {name: "ASD"}
        ];

        // Create the test countries
        for (const data of countryData) {
            await testSetup.fastifyInstance.inject({
                method: 'POST',
                url: '/api/countries',
                payload: data,
                headers: {Authorization: `Bearer ${accessToken}`}
            });
        }

        // Test finding by description field with value "Special"
        const findByResp = await testSetup.fastifyInstance.inject({
            method: 'GET',
            url: '/api/countries/find?filters=name;eq;FieldCountryA',
            headers: {Authorization: `Bearer ${accessToken}`}
        });

        const findByResult = await findByResp.json();
        expect(findByResp.statusCode).toBe(200);
        expect(Array.isArray(findByResult)).toBe(true);
        expect(findByResult.length).toBe(1); // Should find the two countries with "Special" description
        expect(findByResult.some(country => country.name === "FieldCountryA")).toBe(true);
        expect(findByResult.some(country => country.name === "FieldCountryB")).toBe(false);
        expect(findByResult.some(country => country.name === "FieldCountryC")).toBe(false);
    })

    it("should handle error responses correctly when country is not found", async () => {
        const {accessToken} = await testSetup.rootUserLogin()
        expect(accessToken).toBeTruthy()

        // Try to fetch a non-existent country
        const nonExistentId = "123456789012345678901234"; // Valid MongoDB ObjectId that doesn't exist

        const resp = await testSetup.fastifyInstance.inject({
            method: 'GET',
            url: `/api/countries/${nonExistentId}`,
            headers: {Authorization: `Bearer ${accessToken}`}
        });

        // Verify response status code should be 404 Not Found
        expect(resp.statusCode).toBe(404);

        const result = await resp.json();
        expect(result.error).toBeDefined();
        expect(result.message).toContain("Not found");

    });


})
