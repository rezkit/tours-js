export class ValidationError extends Error {
  public name: string = 'Validation Error'

  errors: Record<string, string[]>

  constructor ({ message, errors }: { message: string, errors: Record<string, string[]> }) {
    super(message)
    this.errors = errors
  }
}

export class NotFoundError extends Error {
  name: string = 'Not Found'

  readonly uri: string

  constructor (message: string, uri: string) {
    super(message)
    this.uri = uri
  }
}
