import type {IError} from "@drax/common-back";

class BadCredentialsError extends Error implements IError{
    constructor() {
        super('error.badCredentials')
        this.name = 'BadCredentialsError';
        this.message = 'error.badCredentials'
    }

    get statusCode(){
        return 401
    }


    get i18nMessage(){
        return 'error.badCredentials'
    }

    get body(){
        return {
            statusCode: this.statusCode,
            error: this.name,
            message: this.message,
            i18nMessage: this.i18nMessage,
        }
    }

}

export default BadCredentialsError
