import { FieldValidator } from './field-validator'

export class AlphanumericExtendedValidator implements FieldValidator {
  readonly errorMessage = 'deve conter apenas letras, números e caracteres especiais permitidos (- / .) e não pode estar vazio'

  validate(raw: string): boolean {
    const trimmed = raw.trim()
    if (trimmed.length === 0) return false
    return /^[a-zA-Z0-9\-/.]+$/.test(trimmed)
  }
}
