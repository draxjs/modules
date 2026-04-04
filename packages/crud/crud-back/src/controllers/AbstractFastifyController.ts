import AbstractService from "../services/AbstractService";
import {
    CommonConfig,
    DraxConfig,
    LimitError,
    NotFoundError,
    BadRequestError,
    CommonController, setNestedValue
} from "@drax/common-back";
import {IRbac} from "@drax/identity-share";
import type {FastifyReply, FastifyRequest} from "fastify";
import {
    IDraxExportResult,
    IDraxPermission,
    IDraxFieldFilter,
    IDraxExportResponse,
    IDraxCrudEvent,
    IDraxPaginateResult
} from "@drax/crud-share";
import {join} from "path";
import QueryFilterRegex from "../regexs/QueryFilterRegex.js";
import CrudEventEmitter from "../events/CrudEventEmitter.js";

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
        dateFormat?: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second'
    }
}>


class AbstractFastifyController<T, C, U> extends CommonController {

    protected service: AbstractService<T, C, U>
    protected permission: IDraxPermission

    protected baseFileDir = DraxConfig.getOrLoad(CommonConfig.FileDir) || 'files';
    protected baseURL = DraxConfig.getOrLoad(CommonConfig.BaseUrl) ? DraxConfig.get(CommonConfig.BaseUrl).replace(/\/$/, '') : ''

    protected entityName: string

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

    protected eventEmitter: CrudEventEmitter

    constructor(service: AbstractService<T, C, U>, permission: IDraxPermission, entityName?: string) {
        super();
        this.service = service
        this.permission = permission
        this.entityName = entityName || this.constructor.name.replace('Fastify', '').replace('Controller', '')
        this.eventEmitter = CrudEventEmitter.getInstance()
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

                if (field && operator && (operator === 'empty' || (value !== undefined && value !== ''))) {
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

        if (rbac.hasSomePermission([this.permission.All, this.permission.ViewAll])) {
            return
        }

        if (this.userFilter && rbac.userId) {
            filters.push({field: this.userField, operator: 'eq', value: rbac.userId})
        }

    }

    protected applyTenantFilter(filters: IDraxFieldFilter[], rbac: IRbac) {
        if (this.tenantFilter && rbac.tenantId) {
            filters.push({field: this.tenantField, operator: 'eq', value: rbac.tenantId})
        }
    }

    protected assertTenant(item: T, rbac: IRbac) {

        //Si tenantAssert esta habilitado y si ademas el usuario pertenece a un tenant
        if (this.tenantAssert && rbac.hasTenant) {

            //Si esta populado
            if (item[this.tenantField]?._id) {
                rbac.assertTenantId(item[this.tenantField]._id.toString())//
                //Si esta crudo
            } else if (item[this.tenantField]) {
                rbac.assertTenantId(item[this.tenantField].toString())
            }
        }
    }

    protected assertUser(item: T, rbac: IRbac) {

        if (this.userAssert) {
            if (item[this.userField]?._id) {
                rbac.assertUserId(item[this.userField]._id.toString())
            } else if (item[this.userField]) {
                rbac.assertUserId(item[this.userField].toString())
            }
        }
    }

    protected assertUserAndTenant(item: T, rbac: IRbac) {
        this.assertTenant(item, rbac)
        this.assertUser(item, rbac)
    }

    protected applyUserAndTenantSetters(payload: any, rbac: any) {

        if (this.tenantSetter && rbac.tenantId) {
            setNestedValue(payload, this.tenantField, rbac.tenantId)
        }

        if (this.userSetter && rbac.userId) {
            setNestedValue(payload, this.userField, rbac.userId)
        }
    }

    protected extractRequestData(request: FastifyRequest) {
        return {
            user: {
                id: request?.rbac?.userId,
                username: request?.rbac?.username,
                role: {
                    id: request?.rbac?.roleId,
                    name: request?.rbac?.roleName,
                },
                tenant: {
                    id: request?.rbac?.tenantId,
                    name: request?.rbac?.tenantName,
                },
                apiKey: {
                    id: request?.rbac?.apiKeyId,
                    name: request?.rbac?.apiKeyName,
                },
                session: request?.rbac?.session,
            },
            ip: request.ip,
            userAgent: request.headers['user-agent'],
            requestId: request.id,
        };
    }


    async onCreated(request: CustomRequest, item: T) {
        const requestData = this.extractRequestData(request)
        const detail = `User ${requestData.user.username} created ${this.entityName}.`
        const eventData: IDraxCrudEvent = {
            action: 'created',
            entity: this.entityName,
            postItem: item,
            preItem: null,
            timestamp: new Date(),
            detail: detail,
            ...requestData
        }
        this.eventEmitter.emitCrudEvent(eventData)
    }

    async onUpdated(request: CustomRequest, preItem: T, postItem: T) {
        const requestData = this.extractRequestData(request)
        const detail = `User ${requestData.user.username} updated ${this.entityName}.`
        const eventData: IDraxCrudEvent = {
            action: 'updated',
            entity: this.entityName,
            postItem: postItem,
            preItem: preItem,
            timestamp: new Date(),
            detail: detail,
            ...requestData
        }
        this.eventEmitter.emitCrudEvent(eventData)
    }

    async onDeleted(request: CustomRequest, item: T) {
        const requestData = this.extractRequestData(request)
        const detail = `User ${requestData.user.username} deleted ${this.entityName}.`
        const eventData: IDraxCrudEvent = {
            action: 'deleted',
            entity: this.entityName,
            postItem: null,
            preItem: item,
            timestamp: new Date(),
            detail: detail,
            ...requestData
        }
        this.eventEmitter.emitCrudEvent(eventData)
    }

    async onExported(request: CustomRequest, response: IDraxExportResponse) {
        const requestData = this.extractRequestData(request)
        const detail = `User ${requestData.user.username} exported ${this.entityName}.`
        const eventData: IDraxCrudEvent = {
            action: 'exported',
            entity: this.entityName,
            postItem: null,
            preItem: null,
            timestamp: new Date(),
            detail: detail,
            ...requestData
        }
        this.eventEmitter.emitCrudEvent(eventData)
    }

    async preCreate(request: CustomRequest, payload: any) {
        return payload
    }

    async postCreate(request: CustomRequest, item: T) {
        return item
    }

    async create(request: CustomRequest, reply: FastifyReply) {
        try {
            request.rbac.assertPermission(this.permission.Create)
            const payload = request.body
            this.applyUserAndTenantSetters(payload, request.rbac)
            await this.preCreate(request, payload as C)
            let item = await this.service.create(payload as C)
            this.onCreated(request, item)
            item = await this.postCreate(request, item as T)
            return item
        } catch (e) {
            this.handleError(e, reply)
        }
    }

    async preUpdate(request: CustomRequest, payload: any): Promise<C> {
        return payload
    }

    async postUpdate(request: CustomRequest, item: T) {
        return item
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

            let preItem = await this.service.findById(id)

            if (!preItem) {
                reply.statusCode = 404
                reply.send({error: 'NOT_FOUND'})
            }

            if (!request.rbac.hasSomePermission([this.permission.All, this.permission.UpdateAll])) {
                //Si assertUser habilitado y si el usuario no tiene UpdateAll/All, solo puede modificar sus propios registros
                this.assertUser(preItem, request.rbac)
            }
            //Si assertTenant habilitado y si usuario tiene tenant, solo puede modificar registros de su tenant
            this.assertTenant(preItem, request.rbac)

            //Definido el tenant en create no debe modificarse en un update
            if (this.tenantSetter) {
                delete payload[this.tenantField]
            }

            //Definido el user en create no debe modificarse en un update
            if (this.userSetter) {
                delete payload[this.userField]
            }

            await this.preUpdate(request, payload)
            let item = await this.service.update(id, payload as U)

            if (!item) {
                throw new NotFoundError()
            }

            this.onUpdated(request, preItem, item)

            item = await this.postUpdate(request, item as T)

            return item
        } catch (e) {
            this.handleError(e, reply)
        }
    }

    async preUpdatePartial(request: CustomRequest, payload: any): Promise<C> {
        return payload
    }

    async postUpdatePartial(request: CustomRequest, item: T) {
        return item
    }

    //Sobrescribir este metodo para manipular filtros en operaciones de lectura
    async preRead(request: CustomRequest, filters: IDraxFieldFilter[]):Promise<IDraxFieldFilter[]> {
        return filters
    }

    //Sobrescribir este metodo para manipular items a devolver en operaciones de lectura
    async postRead(request: CustomRequest, item: T) {
        return item
    }

    protected isPaginateResult(result: unknown): result is IDraxPaginateResult<T> {
        return typeof result === 'object' && result !== null && 'items' in result && Array.isArray(result.items)
    }

    async postReadItem(request: CustomRequest, item: T): Promise<T> {
        return this.postRead(request, item)
    }

    async postReadItems(request: CustomRequest, items: T[]): Promise<T[]> {
        if (Array.isArray(items)) {
            return Promise.all(items.map(item => this.postRead(request, item)))
        }
        return items
    }

    async postReadPaginate(
        request: CustomRequest,
        pagination: IDraxPaginateResult<T>
    ): Promise<IDraxPaginateResult<T>> {
        if (this.isPaginateResult(pagination)) {
            pagination.items = await Promise.all(pagination.items.map(item => this.postRead(request, item)))
        }
        return pagination
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

            let preItem = await this.service.findById(id)

            if (!preItem) {
                reply.statusCode = 404
                reply.send({error: 'NOT_FOUND'})
            }

            if (!request.rbac.hasSomePermission([this.permission.All, this.permission.UpdateAll])) {
                //Si assertUser habilitado y si el usuario no tiene UpdateAll/All, solo puede modificar sus propios registros
                this.assertUser(preItem, request.rbac)
            }

            //Si assertTenant habilitado y si usuario tiene tenant, solo puede modificar registros de su tenant
            this.assertTenant(preItem, request.rbac)

            //Definido el tenant en el create no debe modificarse en un update
            if (this.tenantSetter) {
                delete payload[this.tenantField]
            }

            //Definido el user en el create no debe modificarse en un update
            if (this.userSetter) {
                delete payload[this.userField]
            }

            await this.preUpdatePartial(request, payload)
            let item = await this.service.updatePartial(id, payload as U)
            if (!item) {
                throw new NotFoundError()
            }

            this.onUpdated(request, preItem, item)

            item = await this.postUpdatePartial(request, item as T)

            return item
        } catch (e) {
            this.handleError(e, reply)
        }
    }

    async preDelete(request: CustomRequest, item: T) {
        return item
    }

    async postDelete(request: CustomRequest, item: T) {
        return item
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

            await this.preDelete(request, item)

            await this.service.delete(id)

            this.onDeleted(request, item)

            await this.postDelete(request, item)

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

            item = await this.postReadItem(request, item)

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

            items = await this.postReadItems(request, items)

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
            let filters = this.parseFilters(request.query.filters)
            this.applyUserAndTenantFilters(filters, request.rbac);

            filters = await this.preRead(request, filters)

            let items = await this.service.find({search, filters, order, orderBy, limit})

            items = await this.postReadItems(request, items)

            return items
        } catch (e) {
            this.handleError(e, reply)
        }
    }

    async findOne(request: CustomRequest, reply: FastifyReply): Promise<T> {
        try {
            request.rbac.assertPermission(this.permission.View)

            const search = request.query.search ??= undefined
            let filters = this.parseFilters(request.query.filters)
            filters = await this.preRead(request, filters)

            this.applyUserAndTenantFilters(filters, request.rbac);

            let item = await this.service.findOne({search, filters})

            item = await this.postReadItem(request, item)

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

            let filters = []
            this.applyUserAndTenantFilters(filters, request.rbac);
            filters = await this.preRead(request, filters)

            let items = await this.service.findBy(field, value, limit, filters)


            items = await this.postReadItems(request, items)

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

            let filters = []
            this.applyUserAndTenantFilters(filters, request.rbac);
            filters = await this.preRead(request, filters)

            let item = await this.service.findOneBy(field, value, filters)


            item = await this.postReadItem(request, item)

            return item
        } catch (e) {
            this.handleError(e, reply)
        }
    }


    async search(request: CustomRequest, reply: FastifyReply) {
        try {
            request.rbac.assertPermission(this.permission.View)
            const search = request.query.search
            let filters = []
            const limit = this.defaultLimit

            this.applyUserAndTenantFilters(filters, request.rbac);
            filters = await this.preRead(request, filters)

            let items = await this.service.search(search, limit, filters)
            items = await this.postReadItems(request, items)
            return items
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
            let filters: IDraxFieldFilter[] = this.parseFilters(request.query.filters)
            this.applyUserAndTenantFilters(filters, request.rbac);
            filters = await this.preRead(request, filters)

            let paginateResult = await this.service.paginate({page, limit, orderBy, order, search, filters})
            paginateResult = await this.postReadPaginate(request, paginateResult)
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
            let filters = this.parseFilters(request.query.filters)

            this.applyUserAndTenantFilters(filters, request.rbac);
            filters = await this.preRead(request, filters)



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

            const response: IDraxExportResponse = {
                url: url,
                rowCount: result.rowCount,
                time: result.time,
                fileName: result.fileName,
            }

            await this.onExported(request, response)

            return response

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

            const dateFormat = request.query.dateFormat ? request.query.dateFormat : 'day'

            if (fields.length === 0) {
                throw new BadRequestError('At least one field is required for grouping')
            }

            let filters: IDraxFieldFilter[] = this.parseFilters(request.query.filters)
            this.applyUserAndTenantFilters(filters, request.rbac)
            filters = await this.preRead(request, filters)

            const result = await this.service.groupBy({fields, filters, dateFormat})

            return result
        } catch (e) {
            this.handleError(e, reply)
        }
    }
}

export default AbstractFastifyController;
export {AbstractFastifyController}

export type {CustomRequest}
