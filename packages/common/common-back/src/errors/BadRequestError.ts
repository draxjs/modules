import type {IError} from "../interfaces/IError";
class BadRequestError extends Error implements IError  {

    i18nMessage: string;

    constructor(message: string = 'BadRequest', i18nMessage: string = 'error.bad_request') {
        super(message);
        this.name = 'BadRequestError';
        this.message = message;
        this.i18nMessage = i18nMessage
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

    get getI18nMessage(){
        return this.i18nMessage || 'error.bad_request'
    }

    get body(){
        return {
            statusCode: this.statusCode,
            error: this.getName,
            message: this.getMessage,
            i18nMessage: this.getI18nMessage,
        }

    }

}

export default BadRequestError
export {BadRequestError}
