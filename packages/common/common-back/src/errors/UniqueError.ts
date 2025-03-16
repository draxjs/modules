import type {IError} from "../interfaces/IError";
class UniqueError extends Error implements IError {
    public entity: any;
    public field: any;

    constructor(message, entity, field) {
        super(message);
        this.name = 'UniqueError';
        this.entity = entity;
        this.field = field;
    }

    get statusCode(){
        return 400
    }

    get message(){
        return `Unique constraint violation for field "${this.field}" on entity "${this.entity}"  `
    }

    get i18nMessage(){
        return 'error.unique'
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

export default UniqueError
