import {ValidationError} from "../errors/ValidationError.js";
import {NotFoundError} from "../errors/NotFoundError.js";
import {BadRequestError} from "../errors/BadRequestError.js";
import {UnauthorizedError} from "../errors/UnauthorizedError.js";
import {ForbiddenError} from "../errors/ForbiddenError.js";
import {MethodNotAllowedError} from "../errors/MethodNotAllowedError.js";
import {InvalidIdError} from "../errors/InvalidIdError.js";
import {SecuritySensitiveError} from "../errors/SecuritySensitiveError.js";
import {UploadFileError} from "../errors/UploadFileError.js";
import {LimitError} from "../errors/LimitError.js";
import {InternalServerError} from "../errors/InternalServerError.js";
import {IRbac} from "@drax/identity-share";
import {FastifyRequest} from "fastify";

declare module 'fastify' {
    interface FastifyRequest {
        rbac?: IRbac;
    }
}

class CommonController{


    handleError(e: unknown, reply: any) {
        console.error(e);

        if (
            e instanceof ValidationError ||
            e instanceof NotFoundError ||
            e instanceof BadRequestError ||
            e instanceof UnauthorizedError ||
            e instanceof ForbiddenError ||
            e instanceof MethodNotAllowedError ||
            e instanceof InvalidIdError ||
            e instanceof SecuritySensitiveError ||
            e instanceof UploadFileError ||
            e instanceof LimitError
        ) {
            reply.status(e.statusCode).send(e.body);
        } else {
            const serverError = new InternalServerError()
            reply.statusCode = serverError.statusCode
            reply.status(500).send(serverError.body);
        }
    }

    protected extractRequestData(request: FastifyRequest) {
        return {
            user:  {
                id: request.rbac.userId,
                username: request.rbac.username,
                role:{
                    id: request.rbac.roleId,
                    name: request.rbac.roleName,
                },
                tenant: {
                    id: request.rbac.tenantId,
                    name: request.rbac.tenantName,
                },
                apiKey: {
                    id: request.rbac.apiKeyId,
                    name: request.rbac.apiKeyName,
                },
                session: request.rbac.session,
            },
            ip: request.ip,
            userAgent: request.headers['user-agent'],
            requestId: request.id,
        };
    }
}

export default CommonController;
export {CommonController}
