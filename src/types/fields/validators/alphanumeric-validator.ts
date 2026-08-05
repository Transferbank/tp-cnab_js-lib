import { FieldValidator } from './field-validator'

export class AlphanumericValidator implements FieldValidator {
  readonly errorMessage = 'deve conter apenas letras e números e não pode estar vazio'

  validate(raw: string): boolean {
    const trimmed = raw.trim()
    if (trimmed.length === 0) return false
    return /^[a-zA-Z0-9]+$/.test(trimmed)
  }
}
