class ServerError extends Error {
  public error: Error;

  constructor(error: Error) {
    super('error.server')
    this.name = 'ServerError'
    this.error = error
  }

  consoleError() {
    console.error(`ServerError - message: ${this.message} stack: ${this.stack}`)
  }

}

export default ServerError
