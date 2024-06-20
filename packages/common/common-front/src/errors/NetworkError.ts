class NetworkError extends Error {
  private error: Error;

  constructor(error: Error) {
    super('error.network')
    this.name = 'NetworkError'
    this.error = error
  }

  consoleError() {
    console.error(`NetworkError - message: ${this.message}`)
  }

}

export default NetworkError
