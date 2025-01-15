class SecuritySensitiveError extends Error {
    constructor(message: string = 'SERVER ERROR') {
        super(message);
        this.name = 'SecuritySensitiveError';
    }

    get statusCode(){
        return 200
    }

}

export default SecuritySensitiveError
