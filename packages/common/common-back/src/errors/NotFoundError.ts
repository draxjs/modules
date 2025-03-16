import type {IError} from "../interfaces/IError";
class NotFoundError extends Error implements IError  {
    constructor(message: string = 'NOT_FOUND') {
        super(message);
        this.name = 'NotFoundError';
    }

    get message(){
        return `Resource not found`
    }

    get statusCode(){
        return 404
    }

    get i18nMessage(){
        return 'error.not_found'
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

export default NotFoundError
