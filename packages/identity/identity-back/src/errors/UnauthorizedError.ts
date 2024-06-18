class UnauthorizedError extends Error {
    constructor() {
        super('UNAUTHORIZED');
        this.name = 'UnauthorizedError';
    }

    get statusCode(){
        return 401
    }

}

export default UnauthorizedError
