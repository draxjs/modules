import type {IError} from "../interfaces/IError";
class LimitError extends Error implements IError {
    private maximum: number;
    private value: number;

    constructor(maximum: number, value: number) {
        super('LimitError');
        this.name = 'LimitError';
        this.maximum = maximum;
        this.value = value;
    }

    get statusCode(){
        return 400
    }
    get message(){
        return `LimitError - Current value: ${this.value} exceeds the maximum allowed value: ${this.maximum}`
    }

    get i18nMessage(){
        return 'error.limit_exceeded'
    }

    get body(){
        return {
            statusCode: this.statusCode,
            error: this.name,
            message: this.message,
            i18nMessage: this.i18nMessage,
        }

    }

    get getMaximum(){
        return this.maximum
    }

    getValue(){
        return this.value
    }




}

export default LimitError
export {LimitError}
