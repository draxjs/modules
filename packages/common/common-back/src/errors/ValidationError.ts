import type {IValidationFieldError} from "../interfaces/IValidationFieldError";

class ValidationError extends Error {
    public errors: IValidationFieldError[];

    constructor(errors: IValidationFieldError[]) {
        super('ValidationError');
        this.name = 'ValidationError';
        this.errors = errors
    }

    get statusCode(){
        return 422 // 422 Unprocessable Entity
    }


}

export default ValidationError
export {ValidationError}
