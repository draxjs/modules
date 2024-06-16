class BadCredentialsError extends Error {
    constructor(message: string = 'Bad credentials') {
        super(message)
        this.name = 'BadCredentialsError'
    }
}

export default BadCredentialsError
