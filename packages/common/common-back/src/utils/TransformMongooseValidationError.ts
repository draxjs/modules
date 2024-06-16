import mongoose from 'mongoose';
import ValidationError from '../errors/ValidationError';
import {IValidationFieldError} from "../interfaces/IValidationFieldError";

function TransformMongooseValidationError( mongooseError: mongoose.Error.ValidationError, entity?: string): ValidationError {
    const errors: IValidationFieldError[] = Object.values(mongooseError.errors).map(error => ({
        entity: entity,
        field: error.path,
        reason: error.message,
        value: error.value
    }));

    return new ValidationError(errors);
}

export default TransformMongooseValidationError;
