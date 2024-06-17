import { ZodError } from 'zod';
import type {IValidationFieldError} from "../interfaces/IValidationFieldError";
import ValidationError from '../errors/ValidationError.js';

function TransformZodValidationError(zodError: ZodError, payload?: any) {
    let errors : IValidationFieldError[] = zodError.errors.map(err => {
        let path = err.path.join('.')
        return {
            field: err.path.join('.'),
            reason: err.message,
            value: payload && payload[path] ? payload[path] : undefined,
        }
    });

    return new ValidationError(errors);
}

export default TransformZodValidationError
