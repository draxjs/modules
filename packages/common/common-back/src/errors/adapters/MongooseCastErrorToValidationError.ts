import mongoose from 'mongoose';
import ValidationError from '../ValidationError.js';
import type {IValidationFieldError} from "../../interfaces/IValidationFieldError";

function MongooseCastErrorToValidationError(mongooseError: mongoose.Error.CastError): ValidationError {
    const error: IValidationFieldError = {
        field: mongooseError.path,
        reason: mongooseError.message,
        value: mongooseError.value
    };

    return new ValidationError([error]);
}

export default MongooseCastErrorToValidationError;
export {MongooseCastErrorToValidationError}
