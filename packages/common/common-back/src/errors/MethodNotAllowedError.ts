import type {IError} from "../interfaces/IError";
class MethodNotAllowedError extends Error implements IError  {
    constructor() {
        super();
        this.name = 'MethodNotAllowedError';
    }

    get statusCode(){
        return 405
    }

    get message(){
        return `Forbidden. Insufficient permissions.`
    }

    get i18nMessage(){
        return 'error.methodNotAllowed'
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

export default MethodNotAllowedError
export {MethodNotAllowedError}
