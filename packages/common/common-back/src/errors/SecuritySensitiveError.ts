import type {IError} from "../interfaces/IError";
class SecuritySensitiveError extends Error implements IError{
    constructor(message: string = 'SERVER ERROR') {
        super(message);
        this.name = 'SecuritySensitiveError';
    }

    get statusCode(){
        return 200
    }

    get message(){
        return `SecuritySensitiveError - ${this.message}`
    }

    get i18nMessage(){
        return 'error.security_sensitive_error'
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

export default SecuritySensitiveError
export {SecuritySensitiveError}
