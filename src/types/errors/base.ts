/**
 * Classes base abstratas para hierarquia de exceptions da lib.
 */

export abstract class CNABError extends Error {
  abstract readonly code: string

  constructor(message: string) {
    super(message)
    this.name = new.target.name
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, new.target)
    }
  }
}

export abstract class CNABInputError extends CNABError {}

export abstract class CNABInternalError extends CNABError {}
