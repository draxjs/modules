class NotFoundError extends Error {
    constructor(message: string = 'NOT_FOUND') {
        super(message);
        this.name = 'NotFoundError';
    }

    get statusCode(){
        return 404
    }

}

export default NotFoundError
