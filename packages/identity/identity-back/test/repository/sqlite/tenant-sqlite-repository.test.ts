import  {describe,it, beforeAll, afterAll} from "vitest"
import {equal} from "assert";
import {ITenant} from "../../../../identity-share/src/interfaces/ITenant";
import {IDraxPaginateResult} from "@drax/crud-share";
import TenantSqliteRepository from "../../../src/repository/sqlite/TenantSqliteRepository";
import {UUID} from "crypto";

describe("TenantRepositoryTest",  function() {

    const repository = new TenantSqliteRepository("test.db", true)

    beforeAll(async () => {
        repository.build()
        return
    })

    afterAll(async () => {
        //await repository.deleteAll()
        return
    })

    it("Delete All.",  async function() {
        let r = await repository.deleteAll()
        equal(r,true)
    })

    it("Create a tenant successfully.",  async function() {
        let tenantData = (await import("../../data-obj/tenants/company-sqlite-tenant")).default
        let tenantCreated: ITenant = await repository.create(tenantData)
        equal(tenantCreated.name,tenantData.name)
    })

    it("Create a second tenant successfully.",  async function() {
        let tenantCreated: ITenant = await repository.create({name: "Company2"  })
        equal(tenantCreated.name,"Company2")
    })


    it("Find tenant by ID successfully.",  async function() {
        let tenantData = (await import("../../data-obj/tenants/company-sqlite-tenant")).default
        let tenant: ITenant = await repository.findById(tenantData._id as UUID)
        equal(tenant.name,tenantData.name)
    })


    it("Retrieving all tenants successfully.",  async function() {
        let tenants: ITenant[] = await repository.fetchAll()
        equal(tenants.length,2)
    })

    it("Paginate tenants successfully.",  async function() {
        let paginateTenants: IDraxPaginateResult<ITenant> = await repository.paginate({page: 1, limit: 5})
        console.log(paginateTenants)
        equal(paginateTenants.items.length,2)
        equal(paginateTenants.total,2)
        equal(paginateTenants.page,1)
        equal(paginateTenants.limit,5)
    })

    it("Update a tenant successfully.",  async function() {
        let tenantData = (await import("../../data-obj/tenants/company-sqlite-tenant")).default
        tenantData.name = "AdminUpdated"
        let tenantUpdated: ITenant = await repository.update(tenantData._id as UUID, tenantData)
        equal(tenantUpdated.name,tenantData.name)
    })

    it("Delete a tenant successfully.",  async function() {
        let tenantData = (await import("../../data-obj/tenants/company-sqlite-tenant")).default
        let tenantDeleted: Boolean = await repository.delete(tenantData._id as UUID)
        equal(tenantDeleted,true)
    })


})
