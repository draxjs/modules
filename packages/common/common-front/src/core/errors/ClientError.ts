class ClientError extends Error {
  error: Error

  constructor(error: Error) {
    const message = 'Client error'
    super(message)
    this.name = 'ClientError'
    this.error = error
    this.consoleError()
  }

  consoleError() {
    console.error(`ClientError - message: ${this.error.message} stack: ${this.error.stack}`)
  }

}

export default ClientError
