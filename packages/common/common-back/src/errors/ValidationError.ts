import {IValidationFieldError} from "../interfaces/IValidationFieldError";

class ValidationError extends Error {
    public errors: IValidationFieldError[];

    constructor(errors: IValidationFieldError[]) {
        super('ValidationError');
        this.name = 'ValidationError';
        this.errors = errors
        this.message = errors.map(error => `${error.field}: ${error.reason}`).join(', ')
    }
}

export default ValidationError
