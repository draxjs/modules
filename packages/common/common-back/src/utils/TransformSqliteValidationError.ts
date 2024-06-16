import ValidationError from '../errors/ValidationError';
import {IValidationFieldError} from "../interfaces/IValidationFieldError";

interface SqliteError extends Error{
    code: string
}

function TransformSqliteValidationError( sqliteError: SqliteError, data: any, entity?: string): ValidationError | SqliteError {
    if(sqliteError.code === 'SQLITE_CONSTRAINT_PRIMARYKEY'){
        const error: IValidationFieldError = {entity:entity, field: 'id', value:data.id, reason:'validation.unique'}
        return new ValidationError([error])
    }

    if(sqliteError.code === 'SQLITE_CONSTRAINT_UNIQUE'){
        const msg = sqliteError.message.split(".")
        let field : string
        let value : any
        if(msg.length === 2){
            field = msg[1]
            value = data[field]
        }
        const error: IValidationFieldError = {entity:entity, field: field, value:value, reason:'validation.unique'}
        return new ValidationError([error])
    }

    return sqliteError
}

export default TransformSqliteValidationError;
