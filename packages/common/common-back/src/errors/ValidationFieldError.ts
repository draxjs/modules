import type {IValidationFieldError} from "../interfaces/IValidationFieldError";

class ValidationFieldError extends Error implements IValidationFieldError{
    public field: string;
    public value: any;
    public reason: string;

    constructor( field: string, value: any, reason: string) {
        super('ValidationFieldError');
        this.name = 'ValidationFieldError';
        this.field = field;
        this.value = value;
        this.reason = reason;
    }
}

export default ValidationFieldError
