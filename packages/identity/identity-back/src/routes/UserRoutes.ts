import UserController from "../controllers/UserController.js";
import {zodToJsonSchema} from "zod-to-json-schema";
import {CrudSchemaBuilder} from "@drax/crud-back";
import {LoginBodyRequestSchema, LoginBodyResponseSchema} from "../schemas/LoginSchema.js"
import {UserSchema, UserCreateSchema, UserUpdateSchema} from "../schemas/UserSchema.js";
import {RegisterBodyRequestSchema, RegisterBodyResponseSchema} from "../schemas/RegisterSchema.js";
import {
    MyPasswordBodyRequestSchema,
    PasswordBodyRequestSchema,
    PasswordBodyResponseSchema
} from "../schemas/PasswordSchema.js";
import {SwitchTenantBodyRequestSchema, SwitchTenantBodyResponseSchema} from "../schemas/SwitchTenantSchema.js";

async function UserRoutes(fastify, options) {

    const controller: UserController = new UserController()
    const schemas = new CrudSchemaBuilder(UserSchema, UserCreateSchema, UserUpdateSchema, 'tenant', 'openApi3', ['Identity']);


    fastify.get('/api/users/search', {schema: schemas.searchSchema}, async (req, rep) => await controller.search(req, rep))

    fastify.get('/api/users/export', {schema: schemas.exportSchema}, (req, rep) => controller.export(req, rep))

    fastify.get('/api/users', {schema: schemas.paginateSchema}, (req, rep) => controller.paginate(req, rep))

    fastify.post('/api/users', {schema: schemas.createSchema}, (req, rep) => controller.create(req, rep))

    fastify.put('/api/users/:id', {schema: schemas.updateSchema}, (req, rep) => controller.update(req, rep))

    fastify.delete('/api/users/:id', {schema: schemas.deleteSchema}, (req, rep) => controller.delete(req, rep))

    fastify.post('/api/auth/login',
        {
            schema: {
                tags: ['Auth'],
                body: zodToJsonSchema(LoginBodyRequestSchema),
                response: {
                    200: zodToJsonSchema(LoginBodyResponseSchema),
                    400: schemas.jsonErrorBodyResponse,
                },
            },
        },
        (req, rep) => controller.auth(req, rep))

    fastify.get('/api/auth/me', {
        schema: {
            tags: ['Auth'],
            response: {
                200: schemas.jsonEntitySchema,
                401: schemas.jsonErrorBodyResponse,
                500: schemas.jsonErrorBodyResponse,
            },
        },
    }, (req, rep) => controller.me(req, rep))

    fastify.post('/api/auth/switch-tenant',
        {
            schema: {
                tags: ['Auth'],
                body: zodToJsonSchema(SwitchTenantBodyRequestSchema),
                response: {
                    200: zodToJsonSchema(SwitchTenantBodyResponseSchema),
                    400: schemas.jsonErrorBodyResponse,
                },
            },
        },
        (req, rep) => controller.switchTenant(req, rep))


    fastify.post('/api/users/register', {
        schema: {
            tags: ['Auth'],
            body: zodToJsonSchema(RegisterBodyRequestSchema),
            response: {
                200: zodToJsonSchema(RegisterBodyResponseSchema),
                400: schemas.jsonErrorBodyResponse,
                500: schemas.jsonErrorBodyResponse,
            },
        },
    }, (req, rep) => controller.register(req, rep))

    fastify.get('/api/users/verify-email/:code', {
        schema: {
            tags: ['Auth'],
        }
    }, (req, rep) => controller.verifyEmail(req, rep))

    fastify.get('/api/users/verify-phone/:code', {
        schema: {
            tags: ['Auth'],
        }
    }, (req, rep) => controller.verifyPhone(req, rep))

    fastify.post('/api/users/password/change', {
        schema: {
            tags: ['Auth'],
            body: zodToJsonSchema(MyPasswordBodyRequestSchema),
            200: zodToJsonSchema(PasswordBodyResponseSchema),
            400: schemas.jsonErrorBodyResponse,
            500: schemas.jsonErrorBodyResponse,
        }
    }, (req, rep) => controller.changeMyPassword(req, rep))

    fastify.post('/api/users/password/change/:id', {
        schema: {
            tags: ['Auth'],
            body: zodToJsonSchema(PasswordBodyRequestSchema),
            200: zodToJsonSchema(PasswordBodyResponseSchema),
            400: schemas.jsonErrorBodyResponse,
            500: schemas.jsonErrorBodyResponse,
        }
    }, (req, rep) => controller.changePassword(req, rep))

    fastify.post('/api/users/password/recovery/request', {
        schema: {
            tags: ['Auth'],
        }
    }, (req, rep) => controller.passwordRecoveryRequest(req, rep))

    fastify.post('/api/users/password/recovery/complete', {
        schema: {
            tags: ['Auth'],
        }
    }, (req, rep) => controller.recoveryPasswordComplete(req, rep))

    fastify.post('/api/users/avatar', {
        schema: {
            tags: ['Auth'],
        }
    }, (req, rep) => controller.updateAvatar(req, rep))

    fastify.get('/api/users/avatar/:filename', {
        schema: {
            tags: ['Auth'],
        }
    }, (req, rep) => controller.getAvatar(req, rep))

}

export default UserRoutes;
export {UserRoutes}
