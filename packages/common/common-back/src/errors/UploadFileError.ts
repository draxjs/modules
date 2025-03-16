import type {IError} from "../interfaces/IError";
class UploadFileError extends Error implements IError{
    constructor(message: string) {
        super(message);
        this.name = 'UploadFileError';
    }

    get statusCode(){
        return 400
    }

    get message(){
        return `File upload failed`
    }

    get i18nMessage(){
        return 'error.upload_file_error'
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

export {UploadFileError}
export default UploadFileError
