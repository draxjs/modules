class BadCredentialsError extends Error {
    constructor() {
        super('error.badCredentials')
        this.name = 'BadCredentialsError';
    }

    get statusCode(){
        return 401
    }

}

export default BadCredentialsError
