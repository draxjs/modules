class UnknownError extends Error {
  public error: Error;

  constructor(error:Error) {
    super('error.unknown')
    this.name = 'UnknownError'
    this.error = error
  }

  consoleError() {
    console.error(`UnknownError - message: ${this.message} stack: ${this.stack}`)
  }

}

export default UnknownError
