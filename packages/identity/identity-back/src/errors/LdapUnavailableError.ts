import type {IError} from '@drax/common-back';

export default class LdapUnavailableError extends Error implements IError {
    constructor() {
        super('error.ldapUnavailable');
        this.name = 'LdapUnavailableError';
    }

    get statusCode() {
        return 503;
    }

    get i18nMessage() {
        return this.message;
    }

    get body() {
        return {
            statusCode: this.statusCode,
            error: this.name,
            message: this.message,
            i18nMessage: this.i18nMessage
        };
    }
}
