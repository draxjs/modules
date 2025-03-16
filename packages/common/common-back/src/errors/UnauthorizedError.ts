import type {IError} from "../interfaces/IError";
class UnauthorizedError extends Error implements IError  {
    constructor(message: string = 'UNAUTHORIZED') {
        super(message);
        this.name = 'UnauthorizedError';
    }

    get statusCode(){
        return 401
    }

    get message(){
        return `Authentication failed`
    }

    get i18nMessage(){
        return 'error.unauthorized'
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

export default UnauthorizedError
