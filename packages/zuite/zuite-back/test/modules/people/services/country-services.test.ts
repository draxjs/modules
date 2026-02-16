import {describe, it, beforeAll, afterAll, expect} from "vitest"
import CountryServiceFactory from "../../../../src/modules/people/factory/services/CountryServiceFactory";
import CountryService from "../../../../src/modules/people/services/CountryService";
import TestSetup from "../../../setup/TestSetup";
import {ICountryBase} from "../../../../src/modules/people/interfaces/ICountry";


describe("Country Service Test", function () {

    let testSetup = new TestSetup()
    let countryService: CountryService

    beforeAll(async () => {
        await testSetup.setup()
        countryService = CountryServiceFactory.instance
    })

    afterAll(async () => {
        await testSetup.dropAndClose()
        return
    })

    it("should create a new country and find by id", async () => {

        await testSetup.dropCollection('Country')

        const newCountry = {
            name: "Italia",
            createdBy: testSetup.rootUser._id
        };

        const country = await countryService.create(newCountry);

        expect(country.name).toBe("Italia");
        expect(country._id).toBeDefined();

        const getCountry = await countryService.findById(country._id);
        expect(getCountry.name).toBe("Italia");
    })

    it("should create and update a country and finally find by id", async () => {

        await testSetup.dropCollection('Country')

        const newCountry = {
            name: "Italia",
            createdBy: testSetup.rootUser._id
        };

        const country = await countryService.create(newCountry);

        expect(country.name).toBe("Italia");
        expect(country._id).toBeDefined();

        const updateData: ICountryBase = {
            name: "ItaliaUpdated"
        }

        const updatedCountry = await countryService.update(country._id, updateData);
        expect(updatedCountry.name).toBe(updateData.name)

        const getCountry = await countryService.findById(country._id);
        expect(getCountry.name).toBe("ItaliaUpdated");

    })

    it("should create and delete a country", async () => {

        await testSetup.dropCollection('Country')

        const newCountry = {
            name: "Italia",
            createdBy: testSetup.rootUser._id
        };

        const country = await countryService.create(newCountry);

        expect(country.name).toBe("Italia");
        expect(country._id).toBeDefined();


        const deleteResult = await countryService.delete(country._id);
        expect(deleteResult).toBe(true);

        // Verify the country was actually deleted by trying to fetch it
        const getCountry = await countryService.findById(country._id);
        expect(getCountry).toBe(null);
    })

    it("Should create and paginate countries", async () => {

        await testSetup.dropCollection('Country')

        // First, create a few countries
        const countryData : ICountryBase[] = [
            {
                name: "Argentina", createdBy: testSetup.rootUser._id
            },
            {
                name: "Brasil", createdBy: testSetup.rootUser._id
            },
            {
                name: "Uruguay", createdBy: testSetup.rootUser._id
            }
        ];

        for (const data of countryData) {
            await countryService.create(data)
        }

        const result =  await countryService.paginate({page: 1, limit: 10})
        expect(result.items.length).toBe(3)
        expect(result.total).toBe(3)
        expect(result.page).toBe(1)
        expect(result.limit).toBe(10)
        expect(result.items[0].name).toBe("Argentina")
    })



    it("should search for countries ", async () => {
        await testSetup.dropCollection('Country')

        // First, create a few countries
        const countryData : ICountryBase[] = [
            {
                name: "SearchCountry1", createdBy: testSetup.rootUser._id
            },
            {
                name: "SearchCountry2", createdBy: testSetup.rootUser._id
            },
            {
                name: "Uruguay", createdBy: testSetup.rootUser._id
            }
        ];

        // Create the test countries
        for (const data of countryData) {
            await countryService.create(data)
        }

        // Test searching with a matching term
        const searchResult =    await countryService.search("Search")
        console.log("searchResult", searchResult)

        expect(searchResult.length).toBe(2); // Should find the two countries with "Search" in their name
        expect(searchResult.some(country => country.name === "SearchCountry1")).toBe(true);
        expect(searchResult.some(country => country.name === "SearchCountry2")).toBe(true);
        expect(searchResult.some(country => country.name === "DifferentCountry")).toBe(false);

    })

    it("should find countries with filters", async () => {
        await testSetup.dropCollection('Country')

        // First, create a few countries
        const countryData : ICountryBase[] = [
            {
                name: "FieldCountryA", createdBy: testSetup.rootUser._id
            },
            {
                name: "FieldCountryB", createdBy: testSetup.rootUser._id
            },
            {
                name: "FieldCountryC", createdBy: testSetup.rootUser._id
            }
        ];


        // Create the test countries
        for (const data of countryData) {
            await countryService.create(data)
        }

        // Test finding by description field with value "Special"
        const findByResult = await countryService.find({filters: [{field: "name", operator: "eq", value: "FieldCountryA"  }]})

        expect(Array.isArray(findByResult)).toBe(true);
        expect(findByResult.length).toBe(1); // Should find the two countries with "Special" description
        expect(findByResult.some(country => country.name === "FieldCountryA")).toBe(true);
        expect(findByResult.some(country => country.name === "FieldCountryB")).toBe(false);
        expect(findByResult.some(country => country.name === "FieldCountryC")).toBe(false);
    })

    it("should handle error responses correctly when country is not found", async () => {

        const nonExistentId = "123456789012345678901234"; // Valid MongoDB ObjectId that doesn't exist

        const resp = await countryService.findById(nonExistentId)

        expect(resp).toBe(null);

    });


})
