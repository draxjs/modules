import AbstractService from "../services/AbstractService";
import {ValidationError} from "@drax/common-back";
import {UnauthorizedError, Rbac} from "@drax/identity-back";
import type {FastifyReply, FastifyRequest} from "fastify";
import {IEntityPermission} from "../interfaces/IEntityPermission";

declare module 'fastify' {
    interface FastifyRequest {
        rbac?: Rbac;
    }
}

type CustomRequest = FastifyRequest<{
    Params: {
        id?: string
        ids?: string
    };
    Querystring:{
        page?: number
        limit?: number
        orderBy?: string
        order?: 'asc' | 'desc' | boolean
        search?: string
    }
}>

class AbstractFastifyController<T,C,U>{

    protected service: AbstractService<T,C,U>
    protected permission: IEntityPermission

    constructor(service: AbstractService<T, C, U>, permission: IEntityPermission) {
        this.service = service
        this.permission = permission
        console.log("AbstractFastifyController created. Permissions", this.permission)
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
            let paginateResult = await this.service.paginate({page, limit, orderBy, order, search})
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
}

export default AbstractFastifyController;
export {AbstractFastifyController}
