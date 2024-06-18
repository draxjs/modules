class UnauthorizedError extends Error {
    constructor() {
        super('NOT_AUTHORIZED');
        this.name = 'UnauthorizedError';
    }

    get statusCode(){
        return 401
    }

}

export default UnauthorizedError
