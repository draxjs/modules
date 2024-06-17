class UnknownError extends Error {

  constructor(message:string) {
    super(message)
    this.name = 'UnknownError'
  }

  consoleError() {
    console.error(`UnknownError - message: ${this.message} stack: ${this.stack}`)
  }

}

export default UnknownError
