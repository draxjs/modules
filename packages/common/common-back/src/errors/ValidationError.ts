import type {IValidationFieldError} from "../interfaces/IValidationFieldError";
import type {IError} from "../interfaces/IError";
class ValidationError extends Error implements IError {
    public errors: IValidationFieldError[];

    constructor(errors: IValidationFieldError[]) {
        super('ValidationError');
        this.name = 'ValidationError';
        this.errors = errors
    }

    get statusCode(){
        return 422 // 422 Unprocessable Entity
    }

    get message(){
        return `Validation error: ${this.errors.map(error => `${error.field}: ${error.reason}`).join(', ')}`
    }

    get i18nMessage(){
        return 'error.validation_error'
    }

    get body(){
        return {
            statusCode: this.statusCode,
            error: this.name,
            message: this.message,
            i18nMessage: this.i18nMessage,
            inputErrors: this.errors
        }
    }

}

export default ValidationError
export {ValidationError}
