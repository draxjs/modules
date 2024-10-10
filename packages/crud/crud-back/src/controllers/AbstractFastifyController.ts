import AbstractService from "../services/AbstractService";
import {CommonConfig, DraxConfig, ValidationError} from "@drax/common-back";
import {UnauthorizedError} from "@drax/common-back";
import type {FastifyReply, FastifyRequest} from "fastify";
import {IDraxExportResult, IDraxPermission} from "@drax/crud-share";
import {join} from "path";

declare module 'fastify' {
    interface FastifyRequest {
        rbac?: any;
    }
}

type CustomRequest = FastifyRequest<{
    Params: {
        id?: string
        ids?: string
        format?: string
    };
    Querystring:{
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


class AbstractFastifyController<T,C,U>{

    protected service: AbstractService<T,C,U>
    protected permission: IDraxPermission

    constructor(service: AbstractService<T, C, U>, permission: IDraxPermission) {
        this.service = service
        this.permission = permission
        console.log("AbstractFastifyController created. Permissions", this.permission)
    }

    protected parseFilters(stringFilters: string): any {
        try {
            if (!stringFilters) {
                return []
            }
            const filterArray = stringFilters.split(";")
            const filters = []
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

    async create(request: CustomRequest, reply: FastifyReply) {
        try {
            request.rbac.assertPermission(this.permission.Create)
            const payload = request.body
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
            if(!request.params.id){
                reply.statusCode = 400
                reply.send({error: 'BAD REQUEST'})
            }
            const id = request.params.id
            const payload = request.body
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
            if(!request.params.id){
                reply.statusCode = 400
                reply.send({error: 'BAD REQUEST'})
            }
            const id = request.params.id
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

    async findById(request:CustomRequest, reply: FastifyReply) {
        try {
            request.rbac.assertPermission(this.permission.View)
            if(!request.params.id){
                reply.statusCode = 400
                reply.send({error: 'BAD REQUEST'})
            }
            const id = request.params.id
            let item = await this.service.findById(id)
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

    async findByIds(request:CustomRequest, reply: FastifyReply) {
        try {
            request.rbac.assertPermission(this.permission.View)
            if(!request.params.ids){
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

    async search(request:CustomRequest, reply: FastifyReply) {
        try {
            request.rbac.assertPermission(this.permission.View)
            const search = request.query.search
            let item = await this.service.search(search)
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
            const filters = this.parseFilters(request.query.filters)
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

    async export(request:CustomRequest, reply: FastifyReply) {
        try {
            request.rbac.assertPermission(this.permission.View)

            const format = request.query.format as 'CSV'|'JSON' || 'JSON'
            const headers = request.query.headers ? request.query.headers.split(",") : []
            const separator = request.query.separator || ";"
            const limit = request.query.limit
            const orderBy = request.query.orderBy
            const order = request.query.order
            const search = request.query.search
            const filters = this.parseFilters(request.query.filters)

            const year = (new Date().getFullYear()).toString()
            const month = (new Date().getMonth() + 1).toString().padStart(2, '0')
            const exportPath = 'exports'

            const destinationPath = join(BASE_FILE_DIR, 'exports',year,month)

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
