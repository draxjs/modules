import type {IError} from "../interfaces/IError";
class OperationFailError extends Error implements IError  {
    constructor(message: string = 'OperationFailError') {
        super(message);
        this.name = 'OperationFailError';
        this.message = message;
    }

    get getMessage(){
        return this.message
    }

    get getName(){
        return this.name
    }

    get statusCode(){
        return 500
    }

    get i18nMessage(){
        return 'error.operation_failed'
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

export default OperationFailError
