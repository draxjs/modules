import type {IGqlError} from "@/interfaces/IGqlError";

class GqlError extends Error implements IGqlError{
  public path: Array<string>;
  public extensions: any;

  constructor(error: IGqlError) {
    super(error.message)
    this.name = 'GqlError'
    this.path = error.path
    this.extensions = error.extensions
    this.consoleError()
  }

  get isBadUserInput(): boolean {
    return this.extensions?.code === 'BAD_USER_INPUT'
  }

  toString(): string {
    return `GqlError - path: ${this.path} message: ${this.message}`
  }

  consoleError() {
    console.error(this.toString())
  }

}

export default GqlError
