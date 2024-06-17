class NetworkError extends Error {

  constructor(message: string) {
    super(message)
    this.name = 'NetworkError'
  }

  consoleError() {
    console.error(`NetworkError - message: ${this.message}`)
  }

}

export default NetworkError
