import type {IGqlError} from "../../interfaces/IGqlError";

class GqlError extends Error implements IGqlError{
  public path: Array<string>;

  constructor(error: IGqlError) {
    super(error.message)
    this.name = 'GqlError'
    this.path = error.path
    this.consoleError()
  }

  toString(): string {
    return `GqlError - path: ${this.path} message: ${this.message}`
  }

  consoleError() {
    console.error(this.toString())
  }

}

export default GqlError
