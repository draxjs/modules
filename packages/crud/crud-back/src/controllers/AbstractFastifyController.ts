import AbstractService from "../services/AbstractService";
import {
    CommonConfig,
    DraxConfig,
    LimitError,
    NotFoundError,
    BadRequestError,
    CommonController
} from "@drax/common-back";
import {IRbac} from "@drax/identity-share";
import type {FastifyReply, FastifyRequest} from "fastify";
import {IDraxExportResult, IDraxPermission, IDraxFieldFilter} from "@drax/crud-share";
import {join} from "path";
import QueryFilterRegex from "../regexs/QueryFilterRegex.js";

declare module 'fastify' {
    interface FastifyRequest {
        rbac?: IRbac;
    }
}

type CustomRequest = FastifyRequest<{
    Params: {
        id?: string
        ids?: string
        format?: string
        field?: string
        value?: string
    };
    Querystring: {
        format?: string
        page?: number
        limit?: number
        orderBy?: string
        order?: 'asc' | 'desc'
        search?: string
        filters?: string
        headers?: string
        headersTranslate?: string
        separator?: string
        fileName?: string
        fields?: string
    }
}>


class AbstractFastifyController<T, C, U> extends CommonController {

    protected service: AbstractService<T, C, U>
    protected permission: IDraxPermission

    protected baseFileDir = DraxConfig.getOrLoad(CommonConfig.FileDir) || 'files';
    protected baseURL = DraxConfig.getOrLoad(CommonConfig.BaseUrl) ? DraxConfig.get(CommonConfig.BaseUrl).replace(/\/$/, '') : ''

    protected tenantField: string = 'tenant'
    protected userField: string = 'user'

    protected tenantFilter: boolean = false
    protected tenantSetter: boolean = false
    protected tenantAssert: boolean = false

    /**
     * userFilter is used to filter items by user field like createdBy with auth user. Used by find, search, paginate
     */
    protected userFilter: boolean = false

    /**
     * userSetter is used to set user like createdBy with auth user. Used by create
     */
    protected userSetter: boolean = false

    /**
     * userSetter is used to verify item user like createdBy with auth user. Used by update, delete, findById
     */
    protected userAssert: boolean = false

    protected defaultLimit: number = 1000
    protected maximumLimit: number = 10000

    constructor(service: AbstractService<T, C, U>, permission: IDraxPermission) {
        super();
        this.service = service
        this.permission = permission
        console.log("AbstractFastifyController created. Permissions", this.permission)
    }

    protected parseFilters(stringFilters: string): IDraxFieldFilter[] {
        try {
            if (!stringFilters) {
                return []
            }

            if (!QueryFilterRegex.test(stringFilters)) {
                throw new BadRequestError("Invalid filters format")
            }

            const filterArray = stringFilters.split("|")
            const filters: IDraxFieldFilter[] = []
            filterArray.forEach((filter) => {
                const [field, operator, value] = filter.split(";")

                if(field && operator && (value !== undefined && value !== '') ) {
                    filters.push({field, operator, value})
                }

            })
            return filters
        } catch (e) {
            console.error("parseFilters error", e)
            throw e
        }
    }

    protected applyUserAndTenantFilters(filters: IDraxFieldFilter[], rbac: IRbac) {
        this.applyTenantFilter(filters, rbac)
        this.applyUserFilter(filters, rbac)
    }

    protected applyUserFilter(filters: IDraxFieldFilter[], rbac: IRbac) {

        if(rbac.hasSomePermission([this.permission.All, this.permission.ViewAll])) {
            return
        }

        if(this.userFilter && rbac.userId) {
            filters.push({field: this.userField, operator: 'eq', value: rbac.userId})
        }

    }

    protected applyTenantFilter(filters: IDraxFieldFilter[], rbac: IRbac) {
        if (this.tenantFilter && rbac.tenantId) {
            filters.push({field: this.tenantField, operator: 'eq', value: rbac.tenantId})
        }
    }

    protected assertTenant(item: T, rbac: IRbac) {
        if (this.tenantAssert) {
            const itemTenantId = item[this.tenantField]?._id ? item[this.tenantField]._id.toString() : null
            rbac.assertTenantId(itemTenantId)
        }
    }

    protected assertUser(item: T, rbac: IRbac) {

        if (this.userAssert) {
            const itemUserId = item[this.userField]?._id ? item[this.userField]._id.toString() : null
            rbac.assertUserId(itemUserId)
        }
    }

    protected assertUserAndTenant(item: T, rbac: IRbac) {
        this.assertTenant(item, rbac)
        this.assertUser(item, rbac)
    }

    protected applyUserAndTenantSetters(payload: any, rbac: any) {
        if (this.tenantSetter && rbac.tenantId) {
            payload[this.tenantField] = rbac.tenantId
        }

        if (this.userSetter && rbac.userId) {
            payload[this.userField] = rbac.userId
        }
    }


    async create(request: CustomRequest, reply: FastifyReply) {
        try {
            request.rbac.assertPermission(this.permission.Create)
            const payload = request.body
            this.applyUserAndTenantSetters(payload, request.rbac)
            let item = await this.service.create(payload as C)
            return item
        } catch (e) {
            this.handleError(e, reply)
        }
    }

    async update(request: CustomRequest, reply: FastifyReply) {
        try {
            request.rbac.assertPermission(this.permission.Update)
            if (!request.params.id) {
                reply.statusCode = 400
                reply.send({error: 'BAD REQUEST'})
            }
            const id = request.params.id
            const payload = request.body

            if (!request.rbac.hasSomePermission([this.permission.All, this.permission.UpdateAll])) {

                let preItem = await this.service.findById(id)

                if (!preItem) {
                    reply.statusCode = 404
                    reply.send({error: 'NOT_FOUND'})
                }

                this.assertUser(preItem, request.rbac)
            }

            //Definido el tenant/user en el create no debe modificarse en un update
            delete payload[this.tenantField]
            delete payload[this.userField]

            let item = await this.service.update(id, payload as U)

            if (!item) {
                throw new NotFoundError()
            }

            return item
        } catch (e) {
            this.handleError(e, reply)
        }
    }

    async updatePartial(request: CustomRequest, reply: FastifyReply) {
        try {
            request.rbac.assertPermission(this.permission.Update)
            if (!request.params.id) {
                reply.statusCode = 400
                reply.send({error: 'BAD REQUEST'})
            }
            const id = request.params.id
            const payload = request.body

            if (!request.rbac.hasSomePermission([this.permission.All, this.permission.UpdateAll])) {

                let preItem = await this.service.findById(id)

                if (!preItem) {
                    reply.statusCode = 404
                    reply.send({error: 'NOT_FOUND'})
                }

                this.assertUser(preItem, request.rbac)
            }

            //Definido el tenant/user en el create no debe modificarse en un update
            delete payload[this.tenantField]
            delete payload[this.userField]

            let item = await this.service.updatePartial(id, payload as U)
            if (!item) {
                throw new NotFoundError()
            }
            return item
        } catch (e) {
            this.handleError(e, reply)
        }
    }

    async delete(request: CustomRequest, reply: FastifyReply) {
        try {
            request.rbac.assertPermission(this.permission.Delete)
            if (!request.params.id) {
                reply.statusCode = 400
                reply.send({error: 'BAD REQUEST'})
            }

            const id = request.params.id

            let item = await this.service.findById(id)

            if (!item) {
                reply.statusCode = 404
                reply.send({error: 'NOT_FOUND'})
            }

            if (!request.rbac.hasSomePermission([this.permission.All, this.permission.DeleteAll])) {
                this.assertUser(item, request.rbac)
            }

            this.assertTenant(item, request.rbac)


            await this.service.delete(id)
            reply.send({
                id: id,
                message: 'Item deleted successfully',
                deleted: true,
                deletedAt: new Date(),
            })
        } catch (e) {
            this.handleError(e, reply)
        }
    }

    async findById(request: CustomRequest, reply: FastifyReply): Promise<T> {
        try {
            request.rbac.assertPermission(this.permission.View)
            if (!request.params.id) {
                reply.statusCode = 400
                reply.send({error: 'BAD REQUEST'})
            }


            const id = request.params.id
            let item = await this.service.findById(id)

            if (!item) {
                throw new NotFoundError()
            }

            if (!request.rbac.hasSomePermission([this.permission.All, this.permission.ViewAll])) {
                this.assertUser(item, request.rbac)
            }

            this.assertTenant(item, request.rbac)

            return item
        } catch (e) {
            this.handleError(e, reply)
        }
    }

    async findByIds(request: CustomRequest, reply: FastifyReply): Promise<T[]> {
        try {
            request.rbac.assertPermission(this.permission.View)
            if (!request.params.ids) {
                reply.statusCode = 400
                reply.send({error: 'BAD REQUEST'})
            }
            const ids = request.params.ids.split(",")
            let items = await this.service.findByIds(ids)

            if (!items || items.length === 0) {
                throw new NotFoundError()
            }

            return items
        } catch (e) {
            this.handleError(e, reply)
        }
    }

    async find(request: CustomRequest, reply: FastifyReply): Promise<T[]> {
        try {
            request.rbac.assertPermission(this.permission.View)

            if (request.query.limit > this.maximumLimit) {
                throw new LimitError(this.maximumLimit, request.query.limit)
            }
            const limit = request.query.limit ? request.query.limit : this.defaultLimit
            const orderBy = request.query.orderBy
            const order = request.query.order
            const search = request.query.search ??= undefined
            const filters = this.parseFilters(request.query.filters)


            this.applyUserAndTenantFilters(filters, request.rbac);

            let items = await this.service.find({search, filters, order, orderBy, limit})


            return items
        } catch (e) {
            this.handleError(e, reply)
        }
    }

    async findOne(request: CustomRequest, reply: FastifyReply): Promise<T> {
        try {
            request.rbac.assertPermission(this.permission.View)

            const search = request.query.search ??= undefined
            const filters = this.parseFilters(request.query.filters)

            this.applyUserAndTenantFilters(filters, request.rbac);

            let item = await this.service.findOne({search, filters})


            return item
        } catch (e) {
            this.handleError(e, reply)
        }
    }

    async findBy(request: CustomRequest, reply: FastifyReply): Promise<T[]> {
        try {
            request.rbac.assertPermission(this.permission.View)
            if (!request.params.field || !request.params.value) {
                reply.statusCode = 400
                reply.send({error: 'BAD REQUEST'})
            }

            const limit = this.defaultLimit
            const field = request.params.field
            const value = request.params.value
            let items = await this.service.findBy(field, value, limit)

            for (let item of items) {
                this.assertUserAndTenant(item, request.rbac)
            }

            return items
        } catch (e) {
            this.handleError(e, reply)
        }
    }

    async findOneBy(request: CustomRequest, reply: FastifyReply): Promise<T> {
        try {
            request.rbac.assertPermission(this.permission.View)
            if (!request.params.field || !request.params.value) {
                reply.statusCode = 400
                reply.send({error: 'BAD REQUEST'})
            }

            const field = request.params.field
            const value = request.params.value
            let item = await this.service.findOneBy(field, value)
            this.assertUserAndTenant(item, request.rbac);

            return item
        } catch (e) {
            this.handleError(e, reply)
        }
    }


    async search(request: CustomRequest, reply: FastifyReply) {
        try {
            request.rbac.assertPermission(this.permission.View)
            const search = request.query.search
            const filters = []
            const limit = this.defaultLimit

            this.applyUserAndTenantFilters(filters, request.rbac);

            let item = await this.service.search(search, limit, filters)
            return item
        } catch (e) {
            this.handleError(e, reply)
        }
    }

    async paginate(request: CustomRequest, reply: FastifyReply) {
        try {
            request.rbac.assertPermission(this.permission.View)


            if (request.query.limit > this.maximumLimit) {
                throw new LimitError(this.maximumLimit, request.query.limit)
            }

            const page = request.query.page ? request.query.page : 1
            const limit = request.query.limit ? request.query.limit : 10
            const orderBy = request.query.orderBy
            const order = request.query.order
            const search = request.query.search
            const filters: IDraxFieldFilter[] = this.parseFilters(request.query.filters)
            this.applyUserAndTenantFilters(filters, request.rbac);

            //console.log("FILTERS",filters)

            let paginateResult = await this.service.paginate({page, limit, orderBy, order, search, filters})
            return paginateResult
        } catch (e) {
            this.handleError(e, reply)
        }
    }


    async export(request: CustomRequest, reply: FastifyReply) {
        try {
            request.rbac.assertPermission(this.permission.View)

            const format = request.query.format as 'CSV' | 'JSON' || 'JSON'
            const headers = request.query.headers ? request.query.headers.split(",") : []
            const headersTranslate = request.query.headersTranslate ? request.query.headersTranslate.split(",") : []
            const separator = request.query.separator || ";"
            const fileName = request.query.fileName || "export"
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
                fileName,
                format,
                headers,
                headersTranslate,
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

    async groupBy(request: CustomRequest, reply: FastifyReply) {
        try {
            request.rbac.assertPermission(this.permission.View)

            const fields: string[] = request.query.fields ?
                request.query.fields.split(',').map(f => f.trim()).filter(f => f.length > 0) :
                []

            if (fields.length === 0) {
                throw new BadRequestError('At least one field is required for grouping')
            }

            const filters: IDraxFieldFilter[] = this.parseFilters(request.query.filters)
            this.applyUserAndTenantFilters(filters, request.rbac)

            const result = await this.service.groupBy({fields, filters})

            return result
        } catch (e) {
            this.handleError(e, reply)
        }
    }
}

export default AbstractFastifyController;
export {AbstractFastifyController}

export type {CustomRequest}
