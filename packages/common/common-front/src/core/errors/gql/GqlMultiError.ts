import type {IGqlError} from "../../interfaces/IGqlError";


class GqlMultiError extends Error{
  public errors: Array<IGqlError>;

  constructor(errors: Array<IGqlError>) {
    const message = 'Graphql Errors'
    super(message)
    this.errors = errors
    this.consoleError()
  }

  toString() {
    return `GqlMultiError - errors: ${ this.errors.map(e => e.toString()).join(',')} `
  }

  consoleError() {
    console.error(this.toString())
  }

}

export default GqlMultiError
