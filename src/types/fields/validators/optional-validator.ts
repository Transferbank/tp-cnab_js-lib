import { FieldValidator } from './field-validator'

export class OptionalValidator implements FieldValidator {
  readonly errorMessage = ''

  validate(_raw: string): boolean {
    return true
  }
}
