class UploadFileError extends Error {
    public statusCode: number;
    constructor(message: string) {
        super(message);
        this.name = 'UploadFileError';
        this.statusCode = 400;
    }
}

export {UploadFileError}
export default UploadFileError
