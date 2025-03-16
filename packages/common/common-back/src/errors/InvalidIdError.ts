import type {IError} from "../interfaces/IError";

class InvalidIdError extends Error implements IError{
    protected _id: string;

    constructor(id: string) {
        super('InvalidIdError');
        this.name = 'InvalidIdError';
        this._id = id;
    }

    get message() {
        return `Invalid ID: ${this._id}`
    }

    get statusCode() {
        return 400
    }

    get i18nMessage() {
        return 'error.invalid_id'
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

export default InvalidIdError
export {InvalidIdError}
