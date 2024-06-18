import mongoose from 'mongoose';
import ValidationError from '../ValidationError.js';
import type {IValidationFieldError} from "../../interfaces/IValidationFieldError";

function MongooseErrorToValidationError(mongooseError: mongoose.Error.ValidationError): ValidationError {
    const errors: IValidationFieldError[] = Object.values(mongooseError.errors).map(error => ({
        field: error.path,
        reason: error.message,
        value: error.value
    }));

    return new ValidationError(errors);
}

export default MongooseErrorToValidationError;
