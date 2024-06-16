import {IValidationFieldError} from "../interfaces/IValidationFieldError";

class ValidationFieldError extends Error implements IValidationFieldError{
    public entity: string;
    public field: string;
    public value: any;
    public reason: string;

    constructor(entity: string, field: string, value: any, reason: string) {
        super('ValidationFieldError');
        this.name = 'ValidationFieldError';
        this.entity = entity;
        this.field = field;
        this.value = value;
        this.reason = reason;
    }
}

export default ValidationFieldError
