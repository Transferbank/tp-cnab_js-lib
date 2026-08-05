import { FieldValidator } from './field-validator'

export class StringValidator implements FieldValidator {
  readonly errorMessage = 'campo não pode estar vazio'

  validate(raw: string): boolean {
    return raw.trim().length > 0
  }
}
