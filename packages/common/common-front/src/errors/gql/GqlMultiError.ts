import GqlError from "./GqlError";


class GqlMultiError extends Error{
  public errors: Array<GqlError>;

  constructor(errors: Array<GqlError>) {
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
