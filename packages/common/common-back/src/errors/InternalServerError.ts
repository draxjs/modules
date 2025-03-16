import type {IError} from "../interfaces/IError";

class InternalServerError extends Error implements IError{
    protected _id: string;

    constructor() {
        super('InternalServerError')
        this.name = 'InternalServerError'
    }

    get message() {
        return `Internal Server Error. Please try again later.`
    }

    get statusCode() {
        return 500
    }

    get i18nMessage() {
        return 'error.internal_server_error'
    }

    get body() {
        return {
            statusCode: this.statusCode,
            error: this.name,
            message: this.message,
            i18nMessage: this.i18nMessage,
        }
    }

}

export default InternalServerError
export {InternalServerError}
