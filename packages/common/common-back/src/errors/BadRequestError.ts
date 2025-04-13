import type {IError} from "../interfaces/IError";
class BadRequestError extends Error implements IError  {
    constructor(message: string = 'BadRequest') {
        super(message);
        this.name = 'BadRequestError';
        this.message = message;
    }

    get getMessage(){
        return this.message
    }

    get getName(){
        return this.name
    }

    get statusCode(){
        return 400
    }

    get i18nMessage(){
        return 'error.bad_request'
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

export default BadRequestError
export {BadRequestError}
