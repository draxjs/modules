import type {IError} from "../interfaces/IError";
class NotFoundError extends Error implements IError  {
    constructor(message: string = 'Not found') {
        super(message);
        this.name = 'NotFoundError';
        this.message = message;
    }

    get getMessage(){
        return this.message
    }

    get getName(){
        return this.name
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
            error: this.getName,
            message: this.getMessage,
            i18nMessage: this.i18nMessage,
        }

    }

}

export default NotFoundError
export {NotFoundError }
