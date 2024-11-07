import AbstractService from "../services/AbstractService";
import {CommonConfig, DraxConfig, ValidationError} from "@drax/common-back";
import {UnauthorizedError} from "@drax/common-back";
import {IRbac} from "@drax/identity-share";
import type {FastifyReply, FastifyRequest} from "fastify";
import {IDraxExportResult, IDraxPermission, IDraxFieldFilter} from "@drax/crud-share";
import {join} from "path";

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
    };
    Querystring: {
        format?: string
        page?: number
        limit?: number
        orderBy?: string
        order?: 'asc' | 'desc' | boolean
        search?: string
        filters?: string
        headers?: string
        separator?: string
    }
}>

const BASE_FILE_DIR = DraxConfig.getOrLoad(CommonConfig.FileDir) || 'files';
const BASE_URL = DraxConfig.getOrLoad(CommonConfig.BaseUrl) ? DraxConfig.get(CommonConfig.BaseUrl).replace(/\/$/, '') : ''


class AbstractFastifyController<T, C, U> {

    protected service: AbstractService<T, C, U>
    protected permission: IDraxPermission

    protected tenantField: string = 'tenant'
    protected userField: string = 'user'

    protected tenantFilter: boolean = false
    protected userFilter: boolean = false

    protected tenantSetter: boolean = false
    protected userSetter: boolean = false

    protected tenantAssert: boolean = false
    protected userAssert: boolean = false

    constructor(service: AbstractService<T, C, U>, permission: IDraxPermission) {
        this.service = service
        this.permission = permission
        console.log("AbstractFastifyController created. Permissions", this.permission)
    }

    protected parseFilters(stringFilters: string): IDraxFieldFilter[] {
        try {
            if (!stringFilters) {
                return []
            }
            const filterArray = stringFilters.split("|")
            const filters: IDraxFieldFilter[] = []
            filterArray.forEach((filter) => {
                const [field, operator, value] = filter.split(",")
                filters.push({field, operator, value})
            })
            return filters
        } catch (e) {
            console.error(e)
            throw e
        }
    }

    private applyUserAndTenantFilters(filters: IDraxFieldFilter[], rbac: any) {
        if (this.tenantFilter && rbac.tenantId) {
            filters.push({field: this.tenantField, operator: 'eq', value: rbac.tenantId})
        }

        if (this.userFilter && rbac.userId && !rbac.hasPermission('user:manage')) {
            filters.push({field: this.userField, operator: 'eq', value: rbac.userId})
        }
    }

    private applyUserAndTenantSetters(payload: any, rbac: any) {
        if (this.tenantSetter && rbac.tenantId) {
            payload[this.tenantField] = rbac.tenantId
        }

        if (this.userSetter && rbac.userId && !payload.user && !rbac.hasPermission('user:manage') ) {
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
            console.error(e)
            if (e instanceof ValidationError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message, inputErrors: e.errors})
            } else if (e instanceof UnauthorizedError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message})
            } else {
                reply.statusCode = 500
                reply.send({error: 'INTERNAL_SERVER_ERROR'})
            }
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
            this.applyUserAndTenantSetters(payload, request.rbac)
            let item = await this.service.update(id, payload as U)
            return item
        } catch (e) {
            console.error(e)
            if (e instanceof ValidationError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message, inputErrors: e.errors})
            } else if (e instanceof UnauthorizedError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message})
            } else {
                reply.statusCode = 500
                reply.send({error: 'INTERNAL_SERVER_ERROR'})
            }
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

            if(!item) {
                reply.statusCode = 404
                reply.send({error: 'NOT_FOUND'})
            }

            if (this.tenantAssert) {
                request.rbac.assertTenantId(item[this.tenantField].id)
            }

            await this.service.delete(id)
            reply.send({message: 'Item deleted successfully'})
        } catch (e) {
            console.error(e)
            if (e instanceof ValidationError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message, inputErrors: e.errors})
            } else if (e instanceof UnauthorizedError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message})
            } else {
                reply.statusCode = 500
                reply.send({error: 'INTERNAL_SERVER_ERROR'})
            }
        }
    }

    async findById(request: CustomRequest, reply: FastifyReply) {
        try {
            request.rbac.assertPermission(this.permission.View)
            if (!request.params.id) {
                reply.statusCode = 400
                reply.send({error: 'BAD REQUEST'})
            }


            const id = request.params.id
            let item = await this.service.findById(id)

            if (this.tenantAssert) {
                request.rbac.assertTenantId(item[this.tenantField].id)
            }

            return item
        } catch (e) {
            console.error(e)
            if (e instanceof ValidationError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message, inputErrors: e.errors})
            } else if (e instanceof UnauthorizedError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message})
            } else {
                reply.statusCode = 500
                reply.send({error: 'INTERNAL_SERVER_ERROR'})
            }
        }
    }

    async findByIds(request: CustomRequest, reply: FastifyReply) {
        try {
            request.rbac.assertPermission(this.permission.View)
            if (!request.params.ids) {
                reply.statusCode = 400
                reply.send({error: 'BAD REQUEST'})
            }
            const ids = request.params.ids.split(",")
            let items = await this.service.findByIds(ids)
            return items
        } catch (e) {
            console.error(e)
            if (e instanceof ValidationError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message, inputErrors: e.errors})
            } else if (e instanceof UnauthorizedError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message})
            } else {
                reply.statusCode = 500
                reply.send({error: 'INTERNAL_SERVER_ERROR'})
            }
        }
    }

    async search(request: CustomRequest, reply: FastifyReply) {
        try {
            request.rbac.assertPermission(this.permission.View)
            const search = request.query.search
            const limit = 1000;
            const filters = this.parseFilters(request.query.filters)

            this.applyUserAndTenantFilters(filters, request.rbac);

            let item = await this.service.search(search, limit, filters)
            return item
        } catch (e) {
            console.error(e)
            if (e instanceof ValidationError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message, inputErrors: e.errors})
            } else if (e instanceof UnauthorizedError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message})
            } else {
                reply.statusCode = 500
                reply.send({error: 'INTERNAL_SERVER_ERROR'})
            }
        }
    }

    async paginate(request: CustomRequest, reply: FastifyReply) {
        try {
            request.rbac.assertPermission(this.permission.View)
            const page = request.query.page
            const limit = request.query.limit
            const orderBy = request.query.orderBy
            const order = request.query.order
            const search = request.query.search
            const filters: IDraxFieldFilter[] = this.parseFilters(request.query.filters)
            this.applyUserAndTenantFilters(filters, request.rbac);

            let paginateResult = await this.service.paginate({page, limit, orderBy, order, search, filters})
            return paginateResult
        } catch (e) {
            console.error(e)
            if (e instanceof ValidationError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message, inputErrors: e.errors})
            } else if (e instanceof UnauthorizedError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message})
            } else {
                reply.statusCode = 500
                reply.send({error: 'INTERNAL_SERVER_ERROR'})
            }
        }
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

            const destinationPath = join(BASE_FILE_DIR, 'exports', year, month)

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

            const url = `${BASE_URL}/api/file/${exportPath}/${year}/${month}/${result.fileName}`


            return {
                url: url,
                rowCount: result.rowCount,
                time: result.time,
                fileName: result.fileName,
            }

        } catch (e) {
            console.error(e)
            if (e instanceof ValidationError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message, inputErrors: e.errors})
            } else if (e instanceof UnauthorizedError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message})
            } else {
                reply.statusCode = 500
                reply.send({error: 'INTERNAL_SERVER_ERROR'})
            }
        }
    }
}

export default AbstractFastifyController;
export {AbstractFastifyController}
