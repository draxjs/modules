import {IValidationFieldError} from "./IValidationFieldError";

interface IError{

    statusCode: number
    name: string
    message: string
    i18nMessage: string

    body: {
        statusCode: number,
        error: string,
        message: string,
        i18nMessage: string,
        inputErrors?: Array<IValidationFieldError>
    }


}

export type {IError}
