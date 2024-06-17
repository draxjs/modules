class ServerError extends Error {

  constructor(message: string) {
    super(message)
    this.name = 'ServerError'
  }

  consoleError() {
    console.error(`ServerError - message: ${this.message} stack: ${this.stack}`)
  }

}

export default ServerError
