class ServerError extends Error {
  error: Error

  constructor(error: Error) {
    const message = 'Server error'
    super(message)
    this.name = 'ServerError'
    this.error = error
    this.consoleError()
  }

  consoleError() {
    console.error(`ServerError - message: ${this.error.message} stack: ${this.error.stack}`)
  }

}

export default ServerError
