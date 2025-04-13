import type {IError} from "../interfaces/IError";
class ForbiddenError extends Error implements IError  {
    constructor() {
        super();
        this.name = 'ForbiddenError';
    }

    get statusCode(){
        return 403
    }

    get message(){
        return `Forbidden. Insufficient permissions.`
    }

    get i18nMessage(){
        return 'error.forbidden'
    }

    get body(){
        return {
            statusCode: this.statusCode,
            error: this.name,
            message: this.message,
            i18nMessage: this.i18nMessage,
        }
    }

}

export default ForbiddenError
export {ForbiddenError}
