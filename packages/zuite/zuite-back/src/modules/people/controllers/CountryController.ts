
import CountryServiceFactory from "../factory/services/CountryServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import type {CustomRequest} from "@drax/crud-back";
import CountryPermissions from "../permissions/CountryPermissions.js";
import type {ICountry, ICountryBase} from "../interfaces/ICountry";
import type {FastifyReply} from "fastify";
import {join} from "path";
import {IDraxExportResult} from "@drax/crud-share";

class CountryController extends AbstractFastifyController<ICountry, ICountryBase, ICountryBase>   {

    constructor() {
        super(CountryServiceFactory.instance, CountryPermissions)
        this.tenantField = "tenant";
        this.userField = "user";
        this.tenantFilter = false;
        this.userFilter = false;
        this.tenantSetter = false;
        this.userSetter = false;
        this.tenantAssert = false;
        this.userAssert = false;
    }

    async export(request: CustomRequest, reply: FastifyReply) {
        try {
            request.rbac.assertPermission(this.permission.View)

            const format = request.query.format as 'CSV' | 'JSON' || 'JSON'
            const headers = request.query.headers ? request.query.headers.split(",") : []
            const separator = request.query.separator || ";"
            const limit = request.query.limit
            const orderBy = request.query.orderBy
            const order = request.query.order
            const search = request.query.search
            const filters = this.parseFilters(request.query.filters)

            this.applyUserAndTenantFilters(filters, request.rbac);

            const year = (new Date().getFullYear()).toString()
            const month = (new Date().getMonth() + 1).toString().padStart(2, '0')
            const exportPath = 'exports'

            const destinationPath = join(this.baseFileDir, 'exports', year, month)

            let result: IDraxExportResult = await this.service.export({
                separator,
                format,
                headers,
                limit,
                orderBy,
                order,
                search,
                filters,
            }, destinationPath)

            const url = `${this.baseURL}/api/file/${exportPath}/${year}/${month}/${result.fileName}`


            return {
                url: url,
                rowCount: result.rowCount,
                time: result.time,
                fileName: result.fileName,
            }

        } catch (e) {
            this.handleError(e, reply)
        }
    }

}

export default CountryController;
export {
    CountryController
}

