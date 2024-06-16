class UnknownError extends Error {
  error: Error

  constructor(error: Error) {
    super('Unknown error')
    this.name = 'UnknownError'
    this.error = error
    this.consoleError()
  }

  consoleError() {
    console.error(`UnknownError - message: ${this.error.message} stack: ${this.error.stack}`)
  }

}

export default UnknownError
