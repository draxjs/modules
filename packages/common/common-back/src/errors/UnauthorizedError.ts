class UnauthorizedError extends Error {
    constructor(message: string = 'UNAUTHORIZED') {
        super(message);
        this.name = 'UnauthorizedError';
    }

    get statusCode(){
        return 401
    }

}

export default UnauthorizedError
