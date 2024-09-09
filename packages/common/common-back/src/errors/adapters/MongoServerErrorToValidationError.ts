import ValidationError from '../ValidationError.js';
import type {IValidationFieldError} from "../../interfaces/IValidationFieldError";
import {MongoServerError} from "mongodb";

function MongoServerErrorToValidationError(error: MongoServerError): ValidationError {

    let field:string, value:any
    if(typeof error.keyValue === 'object' && Object.entries(error.keyValue).length === 1){
         [field, value] = Object.entries(error.keyValue)[0];
    }
    const reason = 'validation.'+ error.codeName

    console.log('field, value, reason',field, value, reason)

    const errors: IValidationFieldError[] = [{
        field: field,
        reason: reason,
        value: value
    }];

    return new ValidationError(errors);
}

export default MongoServerErrorToValidationError;
